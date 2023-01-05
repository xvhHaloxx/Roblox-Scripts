const express = require('express');
const bodyParser = require('body-parser')
const ini = require('ini')
const fs = require('fs')

var config = ini.parse(fs.readFileSync('../settings.ini', 'utf-8'))

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
