const ini = require('ini')
const fs = require('fs')
var downloadFileSync = require('download-file-sync');
const prompt = require('prompt-sync')({sigint: true});
const clc = require('cli-color');
const request = require('request-promise')
const decompress = require('decompress')
const path = require('path')
const rimraf = require('rimraf')

var latestText = downloadFileSync('https://raw.githubusercontent.com/xvhHaloxx/Roblox-Scripts/main/Chess%20AI%20Stuff/latestversion.ini');
fs.writeFile('../../ops/latest.ini', latestText, (err) => {
    if (err) throw err;

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
            console.log(`${clc.greenBright('New version is available would you like to download it?')}`);
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
                // const file = fs.createWriteStream("asd.zip"); // .assets[0].browser_download_url
                // jsonformat.assets[0].browser_download_url
                let thejson = downloadFileSync('https://api.github.com/repos/xvhHaloxx/Roblox-Scripts/releases/latest')
                let jsonformat = JSON.parse(thejson)

                let url = jsonformat.assets[0].browser_download_url;
                let output = path.resolve(__dirname, '../updatedzip');
                output = path.join(output, 'updated.zip')
                console.log(clc.redBright('Do not press anything till it is finished or it can break!'));
                
                request(url)
                    .pipe(fs.createWriteStream(output))
                    .on('finish', function () {
                        console.log(`${clc.greenBright('Zip downloaded!')}`);
                        // console.log('Rerun this file to completely install new version');

                        console.log('\nDeleting old files...');
                        fs.readdir(path.resolve(__dirname, '../../'), (err, files) => {
                            if (err) {
                                console.log(err);
                            }
                            files.forEach(file => {
                                const fileDir = path.join(`${path.resolve(__dirname, '../..')}`, file);
                                if (file !== '.keep') {
                                    // Check if the file is a directory
                                    const stat = fs.statSync(fileDir);
                                    if (stat.isDirectory()) {
                                        // Delete the directory and all its contents
                                        try {
                                            rimraf.sync(fileDir);
                                        } catch (err) {
                                            console.error(err);
                                        }
                                    } else {
                                        // Delete the file
                                        try {
                                            fs.unlinkSync(fileDir);
                                        } catch (err) {
                                            console.error(err);
                                        }
                                    }
                                }
                            });
                        });
                        console.log(clc.greenBright('Files deleted'));

                        console.log('\nExtracting zip...');
                        decompress(path.join(path.resolve(__dirname, '../updatedzip'), 'updated.zip'), path.resolve(__dirname, '../..'))
                            .then(() => {
                                console.log(clc.greenBright('Extraction complete'));
                                fs.unlinkSync(path.join(path.resolve(__dirname, '../updatedzip'), 'updated.zip'))
                                console.log(clc.greenBright('\nUpdate complete!'));
                            })
                            .catch((error) => {throw error});

                        const keypress = async () => {
                            process.stdin.setRawMode(true)
                            return new Promise(resolve => process.stdin.once('data', () => {
                                process.stdin.setRawMode(false)
                                resolve()
                            }))
                            }
                            
                            ;(async () => {
                            await keypress()
                            
                            })().then(process.exit)
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