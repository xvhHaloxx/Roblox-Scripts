@Echo Off
SetLocal EnableExtensions DisableDelayedExpansion

CD /D "%~dp0."

for /f "tokens=1,2 delims==" %%a in (settings.ini) do (
if %%a==major set major=%%b
if %%a==minor set minor=%%b
if %%a==revision set revision=%%b
)

echo Installed Version - %major%.%minor%.%revision%

echo.

If Exist "ops\setupdone.txt" (
    Echo 1. Run Server
    Echo 2. Change Settings
    "%SystemRoot%\System32\choice.exe" /C 12 /M "Do you want to run the server, or change your settings"
    If Not ErrorLevel 2 (

        cls
        echo Starting Server...
        cd %~dp0
        cd server
        call node index.js

        exit /B 1

    ) Else (

        cls
        cd %~dp0
        cd settings
        call node index.js

        exit /B 1

    )
) Else (
    PushD "server" 2>NUL && (
        Echo Installing Modules...
        echo.
        Call npm install
        call npm install ini
        PopD
    )
    PushD "settings" 2>NUL && (
        Call npm install
        call npm install ini cli-color prompt-sync
        PopD
    )

    PushD ".keep\updater" 2>NUL && (
        Call npm install
        call npm install request-promise ini download-file-sync cli-color rimraf fs-extra
        PopD
    )

    CD /D "%~dp0."

    echo setupdone>ops/setupdone.txt

    cls
    echo Modules installed!
    echo Rerun this file to start server or change settings.

    exit /B 1
)

Pause
