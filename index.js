// Dependancies
const express = require('express');
const bodyParser = require('body-parser')

// Engine path
const enginePath = "stockfish-compatibility/stockfish.exe";

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
  await engine.setoption('Hash', 2048);
  await engine.setoption('Threads', 6);
  await engine.isready();
}

(async () => {
  setup();

  // Routes
  app.get('/api/solve', async (req, res) => {
    console.log(`Ran for ${req.query.fen}`);
    try {
      await engine.position(req.query.fen);
      console.log(`Successfully applied fen`);
      
      // Set the board to fen string provided and solve it
      const result = await engine.go({ depth: 16 });

      // Send back the results
      console.log(`Got result!`);
      res.send(result.bestmove);
    } catch (error) {
      setup();
      console.log(error);
      res.send("Failed to get AI result!");
    }
  });

  // Start listening
  app.listen(3000);
})()
