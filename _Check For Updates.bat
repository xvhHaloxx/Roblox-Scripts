@echo off
if exist src\ops\setupdone.txt (

	cd src\.keep\updater
	call node .

) else (

	echo Npm packages are not installed!

)

pause
