#ifndef UNICODE
#define UNICODE
#endif
#include <windows.h>
#include <wchar.h>
int WINAPI wWinMain(HINSTANCE a,HINSTANCE b,LPWSTR c,int d){(void)a;(void)b;(void)c;(void)d;wchar_t file[1024];GetEnvironmentVariableW(L"LOCALAPPDATA",file,1024);wcscat(file,L"\\StageCue\\fake-browser-args.txt");HANDLE f=CreateFileW(file,GENERIC_WRITE,FILE_SHARE_READ,NULL,CREATE_ALWAYS,FILE_ATTRIBUTE_NORMAL,NULL);if(f==INVALID_HANDLE_VALUE)return 1;DWORD n;char text[32768];int len=WideCharToMultiByte(CP_UTF8,0,GetCommandLineW(),-1,text,sizeof(text),NULL,NULL);WriteFile(f,text,len-1,&n,NULL);CloseHandle(f);return 0;}
