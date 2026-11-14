@echo off
setlocal
if not exist "%~dp0StageCue.html" (
  echo StageCue.html is missing. Extract the entire ZIP first.
  pause
  exit /b 1
)
echo Opening StageCue.html in your default browser...
start "" "%~dp0StageCue.html"
if errorlevel 1 (
  echo Open StageCue.html manually with Microsoft Edge or Google Chrome.
  pause
)
