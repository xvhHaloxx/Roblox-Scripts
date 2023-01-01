const prompt = require('prompt-sync')({sigint: true});
const fs = require('fs')
const os = require('os')
const ini = require('ini')
const clc = require('cli-color');

function isInt(n){
    return Number(n) % 1 === 0;
}

if (!fs.existsSync('../settings.ini')) {
    fs.writeFileSync('../settings.ini', '', function(err) {if (err) throw err;})

    let config = ini.parse(fs.readFileSync('../settings.ini', 'utf-8'))
    config.threads = 2
    config.ram = 2
    config.stockfish = 'compatibility'
    fs.writeFileSync('../settings.ini', ini.stringify(config))
}

var config = ini.parse(fs.readFileSync('../settings.ini', 'utf-8'))

var threads = config.threads
var ram = config.ram
var stockfish = config.stockfish
var depth = config.depth

function MainPrompt() {
    threads = config.threads
    ram = config.ram
    stockfish = config.stockfish
    depth = config.depth
    console.log('Choose 1 of the answers listed below')
    console.log(`1 - Change amount of CPU threads to use ${clc.blueBright(`(Your CPU's threads - ${os.cpus().length})`)} - ${clc.greenBright(`Current value: ${threads}`)}`);
    console.log(`2 - Change amount of RAM to use ${clc.blueBright(`(Your RAM amount - ${Math.ceil(os.totalmem() / (1024 * 1024 * 1024))}GB)`)} - ${clc.greenBright(`Current value: ${ram}`)}`);
    console.log(`3 - Change Stockfish type ${clc.blueBright('(Latest/Compatible)')} - ${clc.greenBright(`Current value: ${stockfish}`)}`)
    console.log(`4 - Change depth - ${clc.greenBright(`Current value: ${depth}`)}`)
    let answer = prompt('Answer (Press enter when you type either 1, 2, 3 or 4): ');
    

    if (answer === '1') {
        console.log('\n');
        let amount_of_threads = prompt('How many threads do you want to use?: ')
        if (isInt(amount_of_threads) && Number(amount_of_threads) > 0 && !(Number(amount_of_threads) > (os.cpus().length - 3))) {
            config.threads = amount_of_threads
            fs.writeFileSync('../settings.ini', ini.stringify(config))
            console.clear()
            console.log(`Threads successfully set to ${amount_of_threads}!`);
        } else {
            console.clear()
            console.log('\nPlease input less threads as you need at least 3 left over for your computer to function normally!\n');
            MainPrompt()
            return
        }
    } else if (answer === '2') {
        console.log('\n');
        let amount_of_ram = prompt('How many GB of RAM do you want to use?: ')
        if (isInt(amount_of_ram) && Number(amount_of_ram) > 0 && !(Number(amount_of_ram) >= (Math.ceil(os.totalmem() / (1024 * 1024 * 1024))))) {
            config.ram = amount_of_ram
            fs.writeFileSync('../settings.ini', ini.stringify(config))
            console.clear()
            console.log(`RAM successfully set to ${amount_of_ram}!`);
        } else {
            console.clear()
            console.log('\nPlease do not input more RAM then you have\n');
            MainPrompt()
            return
        }
    } else if (answer === '3') {
        console.log('\n');
        let type = prompt('What Stockfish type do you want to use? 1 - Compatible (Old CPUs) | 2 - Latest (Newer CPUs): ');

        if (type === '1') {
            config.stockfish = 'compatibility'
            fs.writeFileSync('../settings.ini', ini.stringify(config))
            console.clear()
            console.log('Stockfish type successfully set to compatibility!');
        } else if (type === '2') {
            config.stockfish = 'latest'
            fs.writeFileSync('../settings.ini', ini.stringify(config))
            console.clear()
            console.log('Stockfish type successfully set to latest!');
        } else {
            console.clear()
            console.log('\nPlease input a valid answer\n');
            MainPrompt()
            return
        }
    } else if (answer === '4') {
        console.log('\n')
        console.log('Do not put the depth too high as it will take forever to calculate (Recommended: 20 - 25)');
        let inputdepth = prompt('How many moves ahead do you want Stockfish to think?: ');

        if (isInt(inputdepth) && Number(inputdepth) > 0) {
            config.depth = inputdepth
            fs.writeFileSync('../settings.ini', ini.stringify(config))
            console.clear()
            console.log(`Depth successfully set to ${inputdepth}!`);
        }
    } else {
        console.clear()
        console.log('\nPlease input a valid answer\n');
        MainPrompt()
        return
    }
    console.log('\n');
    MainPrompt()
    return
}

MainPrompt()