"""Execute the native Windows launcher under Wine using a temporary fake browser.
Build first with desktop/build-native.py. Set WINE and ZIG to tool executables.
This test uses a fresh disposable WINEPREFIX and never uses a real browser profile.
"""
from pathlib import Path
import os,shutil,subprocess,tempfile,time
root=Path(__file__).resolve().parent.parent
wine=os.environ.get('WINE') or shutil.which('wine')
zig=os.environ.get('ZIG') or shutil.which('zig')
if not wine or not zig:raise SystemExit('Set WINE and ZIG to run the native Windows smoke test.')
exe=root/'build/StageCue.exe'
if not exe.exists():raise SystemExit('Build desktop/build-native.py first.')
with tempfile.TemporaryDirectory(prefix='stagecue-native-') as work:
 work=Path(work);prefix=work/'prefix';cache=work/'cache';cache.mkdir()
 env={**os.environ,'WINEPREFIX':str(prefix),'WINEDEBUG':'-all','XDG_CACHE_HOME':str(cache)}
 def run(args,expected=0):
  p=subprocess.run([wine,*map(str,args)],env=env,capture_output=True,timeout=90)
  assert p.returncode==expected,(p.returncode,p.stdout.decode(errors='replace'),p.stderr.decode(errors='replace'))
  return p
 try:
  run([exe,'--diagnose'],1)
  apps=list((prefix/'drive_c/users').glob('*/AppData/Local/StageCue'));assert len(apps)==1
  app=apps[0];assert '未找到' in (app/'launcher.log').read_text()
  assert (app/'StageCue.html').read_bytes()==(root/'StageCue.html').read_bytes()
  fake=work/'fake-browser.exe'
  subprocess.run([zig,'cc','-target','x86_64-windows-gnu','-municode','-Wl,--subsystem,windows','-O2','-s',str(root/'tests/fake-browser.c'),'-o',str(fake)],check=True)
  standard=prefix/'drive_c/Program Files (x86)/Microsoft/Edge/Application';standard.mkdir(parents=True,exist_ok=True);shutil.copy2(fake,standard/'msedge.exe')
  marker=app/'BrowserProfile/keep-me.txt';marker.parent.mkdir();marker.write_text('existing user data')
  before=(app/'StageCue.html').stat().st_mtime_ns
  run([exe,'--diagnose']);assert before==(app/'StageCue.html').stat().st_mtime_ns
  assert marker.read_text()=='existing user data'
  run([exe]);args=app/'fake-browser-args.txt'
  for _ in range(100):
   if args.exists():break
   time.sleep(.05)
  text=args.read_text();assert '--app=' in text and 'file:///' in text and '--user-data-dir=' in text
  custom=prefix/'drive_c/StageCue Custom/浏览器';custom.mkdir(parents=True);shutil.copy2(fake,custom/'msedge.exe')
  key='HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\msedge.exe'
  run(['reg','add',key,'/ve','/d','C:\\StageCue Custom\\浏览器\\msedge.exe','/f'])
  run([exe])
  for _ in range(100):
   if '浏览器' in args.read_text():break
   time.sleep(.05)
  assert 'StageCue Custom' in args.read_text() and '浏览器' in args.read_text()
  print('PASS: native EXE execution, missing-browser diagnostics, extraction, unchanged page, profile retention, custom browser paths with spaces/Unicode and launch arguments.')
 finally:
  server=Path(wine).with_name('wineserver')
  if server.exists():subprocess.run([str(server),'-k'],env=env,capture_output=True,timeout=15)
