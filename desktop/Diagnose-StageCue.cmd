@echo off
setlocal
if not exist "%~dp0StageCue.exe" (
  echo StageCue.exe is missing. Extract the entire ZIP first.
  pause
  exit /b 1
)
echo Checking StageCue startup...
start "" /wait "%~dp0StageCue.exe" --diagnose
if exist "%LOCALAPPDATA%\StageCue\launcher.log" (
  start "" notepad.exe "%LOCALAPPDATA%\StageCue\launcher.log"
) else (
  echo The executable did not create a diagnostic log.
  echo Please open StageCue.html directly with Edge or Chrome.
  echo If company policy blocks executables, use the HTML version.
  pause
)
