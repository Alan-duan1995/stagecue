"""Build the Windows x64 GUI launcher with a user-installed Zig 0.15.2+ toolchain."""
from pathlib import Path
import os,subprocess,struct
root=Path(__file__).resolve().parent.parent
html=(root/'StageCue.html').read_bytes()
header=root/'desktop/embedded-app.h'
header.write_text('static const unsigned char stagecue_html[]={\n'+',\n'.join(','.join(str(x) for x in html[i:i+24]) for i in range(0,len(html),24))+'\n};\nstatic const unsigned long stagecue_html_len='+str(len(html))+';\n')
output=root/'build/StageCue.exe';output.parent.mkdir(exist_ok=True)
subprocess.run([os.environ.get('ZIG','zig'),'cc','-target','x86_64-windows-gnu','-municode','-Wl,--subsystem,windows','-O2','-s',str(root/'desktop/launcher.c'),'-o',str(output),'-lshlwapi','-lshell32','-lole32','-ladvapi32'],check=True)
exe=output.read_bytes();pe=struct.unpack_from('<I',exe,0x3c)[0]
assert exe[pe:pe+4]==b'PE\0\0' and struct.unpack_from('<H',exe,pe+4)[0]==0x8664
assert struct.unpack_from('<H',exe,pe+24+68)[0]==2
assert html in exe
print('Built native Windows x64 GUI executable:',output,output.stat().st_size,'bytes')
