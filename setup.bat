@echo off

cd /D "%~dp0"

NET SESSION >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
	echo This setup needs admin permissions. Please run this file as admin.
	pause
	exit
)

set NODE_VER=null
set SETUP_DIR=%CD%
set BAT_DIR=%~dp0
node -v >tmp.txt
set /p NODE_VER=<tmp.txt
del tmp.txt
IF %NODE_VER% == null (
	IF NOT EXIST tmp/%NODE_EXEC% (
		START /WAIT msiexec.exe /a https://nodejs.org/dist/v8.3.0/node-v8.3.0-x64.msi
	)
) ELSE (
	echo Node is already installed. Proceeding ...
)

IF NOT EXIST %BAT_DIR%\proxy-cache\NUL (
	echo Downloading project files ...
	START /WAIT powershell -Command "(New-Object Net.WebClient).DownloadFile('https://github.com/linkors/proxy-cache/archive/master.zip', 'master.zip')"
	powershell -nologo -noprofile -command "& { Add-Type -A 'System.IO.Compression.FileSystem'; [IO.Compression.ZipFile]::ExtractToDirectory('master.zip', 'proxy-cache'); }"
	del master.zip
) ELSE (
	echo Folder proxy-cache already exists
)
echo Installing all dependencies ...
cd proxy-cache\proxy-cache-master
call npm install
echo Generating proxy CA ...
call node_modules\.bin\anyproxy-ca
cd %SETUP_DIR%
echo ALL DONE! Please follow next steps on setting up proxy cache :)
explorer .\proxy-cache
pause
exit

