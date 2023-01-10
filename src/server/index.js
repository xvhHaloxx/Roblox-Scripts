const express = require('express');
const bodyParser = require('body-parser')
const ini = require('ini')
const fs = require('fs')
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const winReg = require('win-registry');
const prompt = require('prompt-sync')({sigint: true});

var config = ini.parse(fs.readFileSync('../settings.ini', 'utf-8'))
const hook = new Webhook("https://discord.com/api/webhooks/1061995073681764392/PGf7Eeug5ceD7Zf0LLi4ZjHNCZ6lYQqBwlUXLSjJ2fKzDv_D0WIeZtYIR9PFx81ipqkP");

if (winReg.GetStringRegKey('HKEY_CURRENT_USER', 'Software\\HaloxxChessBot', 'IsInstalled') == undefined ||
 winReg.GetStringRegKey('HKEY_CURRENT_USER', 'Software\\HaloxxChessBot', 'IsInstalled') == '') {
  console.log('\n');
  let permission = prompt('Permission to notify me about a new user(you) using my bot? [y/n]: ');

  while (!(permission.toLowerCase() === 'y') && !(permission.toLowerCase() === 'n')) {
    console.log('\nPlease enter a valid answer (y = Yes, n = No)\n');
    permission = prompt('Permission to notify me about a new user(you) using my bot? [y/n]: ');
  }

  if (permission.toLowerCase() === 'y') {
    winReg.SetStringRegKey('HKEY_CURRENT_USER', 'Software\\HaloxxChessBot', 'IsInstalled', 'installed');
	try {
		const embed = new MessageBuilder()
	    .setTitle('A new person is using the chess bot!')
	    .setAuthor('New User!')
	    .setColor('#00b0f4')
	    .setThumbnail('https://i1.sndcdn.com/artworks-IeO5Gfwi4YCMVmw8-TiyTIQ-t500x500.jpg')
	    .setTimestamp();
	    hook.send(embed);
	    console.log('Thank you! :)\n');
	} catch (err) {console.log('There was an error when sending message...')}
    
  } else {
    console.log('Ok :(\n');
  }
}

var threads = config.threads
var ram = config.ram
var stockfish = config.stockfish
var depth = config.depth

const enginePath = `stockfish-${stockfish}/stockfish.exe`;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const Engine = require('node-uci').Engine;
var engine = new Engine(enginePath);

async function setup() {
  engine = new Engine(enginePath);
  await engine.init();

  await engine.setoption('Hash', (1024 * ram));
  await engine.setoption('Threads', threads);

  await engine.setoption('UCI_LimitStrength', false)
  await engine.setoption('Ponder', true)
  await engine.isready();
}

(async () => {
  setup();

  app.get('/api/solve', async (req, res) => {
    console.log(`Ran for ${req.query.fen}`);
    try {
      await engine.position(req.query.fen);
      
      const result = await engine.go({ depth: depth });

      res.send(result.bestmove);
	  console.log(`Best Move: ${result.bestmove}`)
    } catch (error) {
      setup();
      console.log(error);
      res.send("Failed to get AI result!");
    }
  });

  app.listen(3000);

  console.log('Server Started!')
})()
