require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const translator = require('./translator');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.post('/translate', async (req, res) => {
  const {word} = req.body;

  if (!word) return res.status(200).send([]);

  const translations = await translator(word);
  return res.status(200).send(translations);
  
});

app.listen(process.env.TRANSLATOR_PORT || 9000, () => {
  console.log('Running', process.env.TRANSLATOR_PORT)
});