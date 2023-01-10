@echo off
if exist ..\ops\setupdone.txt (

	cd updater
	call node .

	exit /B 1

) else (

	echo Npm packages are not installed!
	echo Run the "Main.bat" file to install packages.

	exit /B 0
)

pause
