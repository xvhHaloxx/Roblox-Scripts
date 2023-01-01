@Echo Off
SetLocal EnableExtensions DisableDelayedExpansion

CD /D "%~dp0."

If Exist "src\ops\setupdone.txt" (
    Echo 1. Run Server
    Echo 2. Change Settings
    "%SystemRoot%\System32\choice.exe" /C 12 /M "Do you want to run the server, or change your settings"
    If Not ErrorLevel 2 (

        cls
        echo Starting Server...
        cd %~dp0
        cd src/server
        call node index.js

    ) Else (

        cls
        cd %~dp0
        cd src/settings
        call node index.js

    )
) Else (
    PushD "src\server" 2>NUL && (
        Echo Installing Modules...
        Call npm install
        call npm install ini
        PopD
    )
    PushD "src\settings" 2>NUL && (
        Call npm install
        call npm install ini
        call npm install cli-color
        1>"..\ops\setupdone.txt" Echo setupdone
        PopD
    )

    cls
    echo Modules installed!
    echo Rerun this file to start server or change settings.
)

Pause