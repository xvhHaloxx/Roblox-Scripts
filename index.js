// Dependancies
const express = require('express');
const bodyParser = require('body-parser')

// Engine path
const enginePath = "stockfish_15.1_win_x64_avx2/stockfish-windows-2022-x86-64-avx2.exe";

// Setup server
const app = express();

// Parse data into body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Setup chess engine
const Engine = require('node-uci').Engine;
var engine = new Engine(enginePath);

async function setup() {
  engine = new Engine(enginePath);
  await engine.init();

  await engine.setoption('Hash', (1024 * 2)); // This will use 2 GB of RAM
  await engine.setoption('Threads', 4); // Logical processors of CPU


  await engine.setoption('UCI_Elo', 3800),
  await engine.setoption('Skill Level', 25),
  await engine.setoption('UCI_LimitStrength', false)
  await engine.setoption('Ponder', true)
  await engine.isready();
}

(async () => {
  setup();

  // Routes
  app.get('/api/solve', async (req, res) => {
    console.log(`Ran for ${req.query.fen}`);
    try {
      await engine.position(req.query.fen);
      
      // Set the board to fen string provided and solve it
      const result = await engine.go({ depth: 20 });

      // Send back the results
      res.send(result.bestmove);
	  console.log(`Best Move: ${result.bestmove}`)
    } catch (error) {
      setup();
      console.log(error);
      res.send("Failed to get AI result!");
    }
  });

  // Start listening
  app.listen(3000);
})()
