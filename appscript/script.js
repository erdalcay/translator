const TRANSLATOR_URL = 'TRANSLATION_API_ENDPOINT';

/**
 * @function translate
 *    Retrieves the translation for the input word from the API endpoint.
 *
 * @param {string} word
 *    The word that will be translated.
 *    Gets encoded before being added to the request body.    
 */
function translate(word) {
  const data = {
    'word': encodeURI(word)
  };
  const options = {
    'method' : 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(data)
  };
  try {
    const httpResponse = UrlFetchApp.fetch(
        TRANSLATOR_URL, options
    );
    return httpResponse.getContentText();
  } catch(e) {
    return JSON.stringify([]);
  }    
}

/**
 * @function deepl
 *    Custom formula functions that fetches the translations from the API.
 * 
 * @param {string} cellValue
 *    The word that will be translated.
 *
 * @return {Array<Array<string>>}
 *    Translation results.
 *    Custom message in case of translation is not succesfull.
 */
function deepl(cellValue) {
  const translations = JSON.parse(
      translate(cellValue.trim())
    );

  if (!translations.length) {
    return ['No Result.'];
  } 

  const output = [];

  translations.forEach((translationLine) => {
    output.push(
      `Type\n\n${translationLine.type}`
      );

    translationLine.translations.forEach((line, i) => {
      output.push(
        `Translation ${i + 1}.\n\n${line.translation}`
        );   

      line.examples.forEach((example, j) => {
        output.push(
          `Translation ${i + 1} - Example ${j+1}\n\n${example.source}\n${example.target}`
          );
      });
    });
  });

  return [output];
}

/**
 * Wrapper for easier logging.
 */
function log(message) {
  Logger.log(message);
}

/**
 * To test the custom function outside the sheet.
 */
function test() {
  const word = 'freund';
  
  log(
    deepl(word)
  );

  return;
}