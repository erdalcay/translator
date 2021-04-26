const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4469.0 Safari/537.36';
const DEEPL_DE_EN = 'https://www.deepl.com/translator#de/en/';
const DEEPL_SEARCH_URL = 'https://dict.deepl.com/german-english/search';

module.exports = word => 
  new Promise(async (resolve) => {
    const browser = await puppeteer.launch();
    const url = DEEPL_DE_EN + word;
    const translations = [];

    try {
      const page = await browser.newPage();
      // Set user-agent
      await page.setUserAgent(USER_AGENT);
      // Request interception
      await page.setRequestInterception(true);
      // Block css & images
      page.on('request', (request) => {
        if (['stylesheet', 'font', 'image', 'other'].indexOf(request.resourceType()) > -1) {
          request.abort();
        } else {
          request.continue();
        }
      });
      // Listen for translations
      page.on('response', async (response) => {
        if (response.url().startsWith(DEEPL_SEARCH_URL)) {
          const translation = await response.text();
          const $ = cheerio.load(translation);
  
          // Each translation line
          $('div.lemma').each((i, el) => {          
            // Get input word & type
            const inputWord = $(el).find('h2 span.tag_lemma a').text().trim();
            const wordType = $(el).find('h2 span.tag_wordtype').text().trim();
  
            const output = {};
            output.source = inputWord;
            output.type = wordType;
            output.translations = [];
            
            // Translation lines
            $(el).find('.lemma_content .translation_lines .translation.featured').each((_, translation) => {
  
              const translationTitle = $(translation).find('h3.translation_desc span.tag_trans a').text().trim();
  
              const line = {};
              line.translation = translationTitle;
              line.examples = [];
              
              $(translation).find('div.example_lines div.line').each((_, example) => {
  
                const exampleLineSource = $(example).find('span.tag_s').text().trim();
                const exampleLineTarget = $(example).find('span.tag_t').text().trim();
  
                line.examples.push({
                  'source': exampleLineSource,
                  'target': exampleLineTarget
                });
  
              });
  
              output.translations.push(line);
            });
  
            translations.push(output);
          });
          
          await browser.close();
          resolve(translations);
        } 
      });

      await page.goto(url);
    } catch(e) {
      await browser.close();
      resolve([]);
    }
  });