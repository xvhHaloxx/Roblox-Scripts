const ini = require('ini')
const fs = require('fs')
const fsextra = require('fs-extra')
var downloadFileSync = require('download-file-sync');
const prompt = require('prompt-sync')({sigint: true});
const clc = require('cli-color');
const request = require('request-promise')
const decompress = require('decompress')
const path = require('path')
const rimraf = require('rimraf')

var latestText = downloadFileSync('https://raw.githubusercontent.com/xvhHaloxx/Roblox-Scripts/main/Chess%20AI%20Stuff/latestversion.ini');
fs.writeFile('../../ops/latest.ini', latestText, (err10) => {
    if (err10) throw err10;

    var currentIniFile = ini.parse(fs.readFileSync('../../settings.ini', 'utf-8'))
    var latestIniFile = ini.parse(fs.readFileSync('../../ops/latest.ini', 'utf-8'))

    var current_major = currentIniFile.major
    var current_minor = currentIniFile.minor
    var current_revision = currentIniFile.revision

    var latest_major = latestIniFile.major
    var latest_minor = latestIniFile.minor
    var latest_revision = latestIniFile.revision

    var mergedCurrent = `${String(current_major)}${String(current_minor)}${String(current_revision)}`
    var mergedLatest = `${String(latest_major)}${String(latest_minor)}${String(latest_revision)}`

    // https://api.github.com/repos/xvhHaloxx/Roblox-Scripts/releases/latest

    function downloadLatestVersion() {
        if (Number(mergedCurrent) < Number(mergedLatest)) {
            console.log(`${clc.greenBright('New version is available! Would you like to download it?')}`);
            console.log('1 - Yes');
            console.log('2 - No');
            let answer = prompt('Answer - ')
        
            while (!(answer == '1') && !(answer == '2')) {
                console.log(`\n${clc.redBright('Please input a valid answer')}\n`);
                console.log('1 - Yes');
                console.log('2 - No');
                answer = prompt('Answer: ')
            }

            if (answer === '1') {
                let thejson = downloadFileSync('https://api.github.com/repos/xvhHaloxx/Roblox-Scripts/releases/latest')
                let jsonformat = JSON.parse(thejson)

                let url = jsonformat.assets[0].browser_download_url;
                let output = path.resolve(__dirname, '../updatedzip');
                output = path.join(output, 'updated.zip')
                console.log(clc.redBright('Do not press anything until it is finished!'));
                
                console.log('\nDeleting old files...');
                try {
                    let files1212 = fs.readdirSync(path.resolve(__dirname, '../../'))
                    files1212.forEach(file => {
                        let fileDir = path.join(`${path.resolve(__dirname, '../..')}`, file);
                        if (file !== '.keep') {
                            // Check if the file is a directory
                            let stat = fs.statSync(fileDir);
                            if (stat.isDirectory()) {
                                // Delete the directory and all its contents
                                try {
                                    rimraf.sync(fileDir);
                                } catch (err2) {
                                    throw err2;
                                }
                            } else {
                                // Delete the file
                                try {
                                    fs.unlinkSync(fileDir);
                                    
                                } catch (err3) {
                                    throw err3;
                                }
                            }
                        }
                    });
                } catch(err123123123) {throw err123123123}

                try {
                    let files121212 = fs.readdirSync(path.resolve(__dirname, '../../../'))
                    files121212.forEach(file => {
                        let fileDir = path.join(`${path.resolve(__dirname, '../../../')}`, file);
                        if (file !== 'src') {
                            // Check if the file is a directory
                            let stat = fs.statSync(fileDir);
                            if (stat.isDirectory()) {
                                // Delete the directory and all its contents
                                try {
                                    rimraf.sync(fileDir);
                                } catch (err2) {
                                    throw err2;
                                }
                            } else {
                                // Delete the file
                                try {
                                    fs.unlinkSync(fileDir);
                                } catch (err3) {
                                    throw err3;
                                }
                            }
                        }
                    });
                } catch(err123123) {throw err123123}
                console.log(clc.greenBright('Files deleted!'));

                console.log('\nDownloading new update...');
                request(url)
                    .pipe(fs.createWriteStream(output))
                    .on('finish', function () {
                        console.log(`${clc.greenBright('Zip downloaded!')}`);
                        // console.log('Rerun this file to completely install new version');

                        

                        console.log('\nExtracting zip...');

                        try {
                            decompress(path.join(path.resolve(__dirname, '../updatedzip'), 'updated.zip'), path.resolve(__dirname, '../updatedzip/updated'))
                            .then(() => {
                                console.log(clc.greenBright('Extraction complete!'));
                                console.log('\nMoving files...');
                                rimraf.sync(path.join(path.resolve(__dirname, '../updatedzip/updated'), 'src', '.keep'));

                                fs.unlinkSync(path.join(path.resolve(__dirname, '../updatedzip'), 'updated.zip'))

                                try {
                                    let files = fs.readdirSync(path.resolve(__dirname, '../updatedzip/updated'))

                                    files.forEach(file => {
                                        let fileDir = path.join(path.resolve(__dirname, '../updatedzip/updated'), file);
                                        if (file === 'src') {
                                            fs.readdir(fileDir, (srcErr, srcFiles) => {
                                                if (srcErr) throw srcErr;
                                                
                                                srcFiles.forEach(srcFile => {
                                                    let fileDir2 = path.join(path.resolve(__dirname, '../updatedzip/updated/src'), srcFile);
                                                    let stat = fs.statSync(fileDir2);
                                                
                                                    if (stat.isDirectory()) {
                                                        fs.renameSync(fileDir2, path.resolve(__dirname, `../../${srcFile}`))
                                                    } else {
                                                        fs.renameSync(fileDir2, path.resolve(__dirname, `../../${srcFile}`))
                                                    }
                                                })
                                            })
                                        } else {
                                            let stat = fs.statSync(fileDir);
                                            if (stat.isDirectory()) {
                                                fsextra.moveSync(fileDir, path.resolve(__dirname, '../../..'))
                                            } else {
                                                fs.renameSync(fileDir, path.resolve(__dirname, `../../../${file}`))
                                            }
                                        }
                                    })
                                } catch(err) {throw err}
                                console.log(clc.greenBright('\nUpdate complete!'));

                                const keypress = async () => {
                                    process.stdin.setRawMode(true)
                                    return new Promise(resolve => process.stdin.once('data', () => {
                                        process.stdin.setRawMode(false)
                                        resolve()
                                    }))
                                    (async () => {
                                        console.log('\nPress any key to exit...');
                                        await keypress()
                                    
                                    })().then(process.exit)
                                }
                            })
                        } catch (err) {throw err}
                    });

            } else if (answer === '2') {
                console.log('\nwell then bye bye');
            }
        } else {
            console.log('You are on the latest version already!');
        }
    }
    downloadLatestVersion()
})