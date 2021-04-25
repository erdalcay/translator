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
  // Already send the status
  res.status(200).send(translations);
  
  return;
});

app.listen(process.env.TRANSLATOR_PORT, () => {
  console.log('Running')
});
