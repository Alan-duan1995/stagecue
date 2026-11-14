#ifndef UNICODE
#define UNICODE
#endif
#define _UNICODE
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <shlobj.h>
#include <shlwapi.h>
#include <stdio.h>
#include <stdarg.h>
#include <wchar.h>
#include <string.h>
#include "embedded-app.h"

#define APP_VERSION L"2.0.1 native"
#define CAP 32768
static wchar_t appdir[CAP], htmlpath[CAP], logpath[CAP], browserpath[CAP];
static BOOL diagnose=FALSE;
static void logline(const wchar_t *format,...){
 wchar_t message[CAP];va_list args;va_start(args,format);_vsnwprintf(message,CAP-1,format,args);va_end(args);message[CAP-1]=0;
 char utf8[CAP*4];int n=WideCharToMultiByte(CP_UTF8,0,message,-1,utf8,sizeof(utf8),NULL,NULL);
 if(n<=0)return;HANDLE f=CreateFileW(logpath,FILE_APPEND_DATA,FILE_SHARE_READ|FILE_SHARE_WRITE,NULL,OPEN_ALWAYS,FILE_ATTRIBUTE_NORMAL,NULL);
 if(f!=INVALID_HANDLE_VALUE){DWORD done;WriteFile(f,utf8,(DWORD)n-1,&done,NULL);WriteFile(f,"\r\n",2,&done,NULL);CloseHandle(f);}
}
static int fail(const wchar_t *stage,DWORD code){
 wchar_t detail[2048]=L"",message[CAP];FormatMessageW(FORMAT_MESSAGE_FROM_SYSTEM|FORMAT_MESSAGE_IGNORE_INSERTS,NULL,code,0,detail,2048,NULL);
 logline(L"ERROR: %ls; Win32=%lu; %ls",stage,(unsigned long)code,detail);
 _snwprintf(message,CAP-1,L"StageCue 未能启动。\n\n%ls\n错误代码：%lu\n%ls\n\n诊断日志：%ls\n\n也可直接打开下载包中的 StageCue.html。",stage,(unsigned long)code,detail,logpath);
 message[CAP-1]=0;if(!diagnose)MessageBoxW(NULL,message,L"StageCue 启动诊断",MB_OK|MB_ICONERROR);return 1;
}
static BOOL joinpath(wchar_t *out,const wchar_t *base,const wchar_t *suffix){
 size_t n=wcslen(base),m=wcslen(suffix);if(n+m+2>=CAP){SetLastError(ERROR_FILENAME_EXCED_RANGE);return FALSE;}
 wcscpy(out,base);if(n&&base[n-1]!=L'\\')wcscat(out,L"\\");wcscat(out,suffix);return TRUE;
}
static BOOL isfile(const wchar_t *name){DWORD a=GetFileAttributesW(name);return a!=INVALID_FILE_ATTRIBUTES&&!(a&FILE_ATTRIBUTE_DIRECTORY);}
static BOOL browserFromRegistry(HKEY root,REGSAM view,const wchar_t *name){
 wchar_t key[512];_snwprintf(key,512,L"SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\%ls",name);HKEY h;
 if(RegOpenKeyExW(root,key,0,KEY_READ|view,&h)!=ERROR_SUCCESS)return FALSE;
 DWORD type=0,bytes=sizeof(browserpath);LONG r=RegQueryValueExW(h,NULL,NULL,&type,(BYTE*)browserpath,&bytes);RegCloseKey(h);
 if(r!=ERROR_SUCCESS||(type!=REG_SZ&&type!=REG_EXPAND_SZ))return FALSE;browserpath[CAP-1]=0;
 if(type==REG_EXPAND_SZ){wchar_t expanded[CAP];DWORD n=ExpandEnvironmentStringsW(browserpath,expanded,CAP);if(!n||n>=CAP)return FALSE;wcscpy(browserpath,expanded);}
 size_t n=wcslen(browserpath);if(n>1&&browserpath[0]==L'"'&&browserpath[n-1]==L'"'){memmove(browserpath,browserpath+1,(n-2)*sizeof(wchar_t));browserpath[n-2]=0;}
 return isfile(browserpath);
}
static BOOL findbrowser(void){
 const wchar_t *names[]={L"msedge.exe",L"chrome.exe"};
 const wchar_t *roots[]={L"ProgramFiles(x86)",L"ProgramFiles",L"LOCALAPPDATA"};
 const wchar_t *relative[]={L"Microsoft\\Edge\\Application\\msedge.exe",L"Google\\Chrome\\Application\\chrome.exe"};
 // Prefer Edge consistently, including installations registered at a custom path.
 for(int browser=0;browser<2;browser++){
  if(browserFromRegistry(HKEY_CURRENT_USER,0,names[browser])||browserFromRegistry(HKEY_LOCAL_MACHINE,KEY_WOW64_64KEY,names[browser])||browserFromRegistry(HKEY_LOCAL_MACHINE,KEY_WOW64_32KEY,names[browser]))return TRUE;
  for(int i=0;i<3;i++){wchar_t base[CAP];DWORD n=GetEnvironmentVariableW(roots[i],base,CAP);if(n&&n<CAP&&joinpath(browserpath,base,relative[browser])&&isfile(browserpath))return TRUE;}
 }
 browserpath[0]=0;return FALSE;
}
static BOOL sameHtml(void){
 HANDLE f=CreateFileW(htmlpath,GENERIC_READ,FILE_SHARE_READ|FILE_SHARE_WRITE|FILE_SHARE_DELETE,NULL,OPEN_EXISTING,FILE_ATTRIBUTE_NORMAL,NULL);if(f==INVALID_HANDLE_VALUE)return FALSE;
 LARGE_INTEGER size;BOOL same=FALSE;if(GetFileSizeEx(f,&size)&&size.QuadPart==(LONGLONG)stagecue_html_len){BYTE *bytes=HeapAlloc(GetProcessHeap(),0,stagecue_html_len);if(bytes){DWORD n=0;same=ReadFile(f,bytes,stagecue_html_len,&n,NULL)&&n==stagecue_html_len&&!memcmp(bytes,stagecue_html,stagecue_html_len);HeapFree(GetProcessHeap(),0,bytes);}}
 CloseHandle(f);return same;
}
static DWORD writeHtml(void){
 if(sameHtml()){logline(L"Embedded HTML unchanged; local page and browser profile preserved.");return ERROR_SUCCESS;}
 wchar_t tmp[CAP];if(_snwprintf(tmp,CAP,L"%ls.%lu.tmp",htmlpath,(unsigned long)GetCurrentProcessId())<0)return ERROR_FILENAME_EXCED_RANGE;
 HANDLE f=CreateFileW(tmp,GENERIC_WRITE,0,NULL,CREATE_ALWAYS,FILE_ATTRIBUTE_NORMAL,NULL);if(f==INVALID_HANDLE_VALUE)return GetLastError();
 DWORD n=0,error=ERROR_SUCCESS;if(!WriteFile(f,stagecue_html,stagecue_html_len,&n,NULL)||n!=stagecue_html_len)error=GetLastError()?GetLastError():ERROR_WRITE_FAULT;
 if(!FlushFileBuffers(f)&&!error)error=GetLastError();CloseHandle(f);
 if(!error&&!MoveFileExW(tmp,htmlpath,MOVEFILE_REPLACE_EXISTING|MOVEFILE_WRITE_THROUGH))error=GetLastError();if(error)DeleteFileW(tmp);else logline(L"Embedded HTML extracted successfully.");return error;
}
int WINAPI wWinMain(HINSTANCE instance,HINSTANCE previous,LPWSTR command,int show){
 (void)instance;(void)previous;(void)show;diagnose=wcsstr(command,L"--diagnose")!=NULL;
 wchar_t base[CAP];DWORD n=GetEnvironmentVariableW(L"LOCALAPPDATA",base,CAP);
 if(!n||n>=CAP){if(FAILED(SHGetFolderPathW(NULL,CSIDL_LOCAL_APPDATA,NULL,SHGFP_TYPE_CURRENT,base))){GetTempPathW(CAP,base);}}
 if(!joinpath(appdir,base,L"StageCue")){wcscpy(logpath,L"StageCue-launcher.log");return fail(L"本地数据路径过长",ERROR_FILENAME_EXCED_RANGE);}
 if(!joinpath(logpath,appdir,L"launcher.log")||!joinpath(htmlpath,appdir,L"StageCue.html"))return fail(L"无法生成本地数据路径",ERROR_FILENAME_EXCED_RANGE);
 int mkdirResult=SHCreateDirectoryExW(NULL,appdir,NULL);if(mkdirResult!=ERROR_SUCCESS&&mkdirResult!=ERROR_ALREADY_EXISTS&&mkdirResult!=ERROR_FILE_EXISTS)return fail(L"无法创建 StageCue 本地数据目录",(DWORD)mkdirResult);
 SYSTEMTIME t;GetLocalTime(&t);logline(L"\nStageCue %ls | %04u-%02u-%02u %02u:%02u:%02u | %ls",APP_VERSION,t.wYear,t.wMonth,t.wDay,t.wHour,t.wMinute,t.wSecond,diagnose?L"diagnostic mode":L"launch");
 logline(L"Data directory: %ls",appdir);
 DWORD error=writeHtml();if(error)return fail(L"无法写入内嵌的演出页面",error);
 if(!findbrowser())return fail(L"未找到 Microsoft Edge 或 Google Chrome。请先安装其中一个浏览器。",ERROR_FILE_NOT_FOUND);
 logline(L"Browser: %ls",browserpath);if(diagnose){logline(L"Diagnostic checks passed. Browser was not launched.");return 0;}
 wchar_t url[CAP],profile[CAP],args[CAP];DWORD count=CAP;
 if(FAILED(UrlCreateFromPathW(htmlpath,url,&count,0)))return fail(L"无法生成本地页面地址",ERROR_INVALID_NAME);
 if(!joinpath(profile,appdir,L"BrowserProfile"))return fail(L"浏览器数据目录路径过长",ERROR_FILENAME_EXCED_RANGE);
 if(_snwprintf(args,CAP,L"\"%ls\" --app=\"%ls\" --user-data-dir=\"%ls\" --no-first-run --disable-background-networking",browserpath,url,profile)<0)return fail(L"浏览器启动参数过长",ERROR_FILENAME_EXCED_RANGE);
 STARTUPINFOW si;PROCESS_INFORMATION pi;ZeroMemory(&si,sizeof(si));ZeroMemory(&pi,sizeof(pi));si.cb=sizeof(si);
 if(!CreateProcessW(browserpath,args,NULL,NULL,FALSE,CREATE_UNICODE_ENVIRONMENT,NULL,appdir,&si,&pi))return fail(L"无法启动浏览器应用窗口",GetLastError());
 logline(L"Browser process started; PID=%lu. Profile: %ls",(unsigned long)pi.dwProcessId,profile);CloseHandle(pi.hThread);CloseHandle(pi.hProcess);return 0;
}
