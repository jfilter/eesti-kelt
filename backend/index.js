/* eslint-disable strict */

'use strict';

const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const async = require('async');
const cors = require('cors');

// Parse the help page of the dictionary every time.
// The page gives also annotations explanation for each rule.
function setupHelp(help) {
  request('http://www.eki.ee/dict/qs/muuttyybid.html', (error, response, body) => {
    if (!error && response.statusCode === 200) {
      // const help = {};
      const $ = cheerio.load(body);
      $('table td > span[class=nr]').each((i, e) => {
        const number = $(e).text().trim();
        const row = $(e).parent().parent();
        const base = row.find('td:nth-child(2)').text().trim();
        const result = { base };

        const nextRow = row.next().text();
        const marker = 'võrdlus:';
        const indexOfMarker = nextRow.indexOf(marker);
        if (indexOfMarker >= 0) {
          const additional = nextRow.substring(indexOfMarker + marker.length).trim();
          result.additional = additional;
        }
        // eslint-disable-next-line no-param-reassign
        help[number] = result;
      });
    }
    return undefined;
  });
}

const help = {};
setupHelp(help);

// Parse the HTML of the complete defition of the Estonian term
function parseCompleteEST(html, estTerm) {
  const $ = cheerio.load(html);

  // Some special treatment because when looking for 'car' => 'auto',
  // there was some problem when choosing the last of $('.tervikart').
  // Thus, we filter out rubish terms that are the same as the terms,
  // but have a '+' in the end.
  const tervikart = $('.tervikart').filter((i, x) => {
    return !$(x).text().trim().startsWith(`${estTerm}+`);
  });

  const notes = tervikart.last().find('.grg .mvq').text();
  const numbersAsString = tervikart.last().find('.grg .mt').text();
  const re = /\d+[a-z]?/ig;
  const numbers = numbersAsString.match(re);
  return { notes, numbers };
}

// For the given Estonian term, get the complete defitions.
function fetchCompleteEST(term, done) {
  const url = `http://www.eki.ee/dict/qs/index.cgi?&F=M&C01=1&C02=1&Q=${encodeURI(term.estTerm)}`;
  request(url, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const infos = parseCompleteEST(body, term.estTerm);
      const result = { estTerm: term.estTerm };

      if (infos.notes !== '') {
        result.notes = infos.notes;
      }

      const numbers = infos.numbers;
      let rule = '';
      if (numbers && numbers[0] !== '') {
        rule = numbers.map((x) => {
          if (x !== '' && x in help) {
            return { number: x, text: help[x].base };
          }
          return undefined;
        });
        result.rule = rule;
      }
      done(null, result);
    } else {
      done(error);
    }
  });
}

// After retrieving the body, parse for all the Estonian terms (to the orignal English term)
// NB: For some English term, several Estonian terms exists
function parseENtoEST(html, englTerm, done) {
  const $ = cheerio.load(html);
  const terms = [];
  // check for the entries that are eqivalent to our term
  // and then get all the possible words from there
  $('span[lang=en]').each((i, e) => {
    if ($(e).text() === englTerm) {
      $(e).parent().find('.x').each((ii, ee) => terms.push({ estTerm: ee.children[0].data }));
    }
  });

  return async.map(terms, fetchCompleteEST, (error, result) => {
    if (!error) {
      const filtered = result;
      // I am not sure if the result needs to get filterd. If yes, use the below.
      // const filtered = result.filter(x => x !== null);
      // const filtered = result;
      done(null, { englTerm, list: filtered });
    } else {
      done(error);
    }
  });
}

// Translate the English term to Estonian and proceed
function fetchENtoEST(englTerm, done) {
  const url = `http://www.eki.ee/dict/ies/index.cgi?F=M&C06=en&C01=1&C02=1&C12=1&C13=1&Q=${encodeURI(englTerm)}`;
  request(url, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      parseENtoEST(body, englTerm, done);
    } else {
      done(error);
    }
  });
}

// From the starting term, get 5 suggestions (similar words) and proeed
function getSuggestions(term, res) {
  const url = `http://www.eki.ee/dict/shs_soovita.cgi?D=ies&F=M&term=${encodeURI(term)}`;
  request(url, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      let suggestions = JSON.parse(body).map((x) => {
        const start = x.indexOf('>') + 1;
        const end = x.indexOf('</');
        const s = x.substring(start, end);
        return s;
      });

      if (suggestions.indexOf(term) === -1) {
        suggestions = [term].concat(suggestions);
      }
      suggestions = suggestions.slice(0, 5);

      async.map(suggestions, fetchENtoEST, (error2, result) => {
        if (!error2) {
          const filtered = result.filter(x => x.list.length > 0);
          res.json(filtered);
        } else {
          res.status(500).send(error);
        }
      });
    }
  });
}

const app = express();
app.use(cors());

app.get('/eestikelt', (req, res) => {
  const term = req.query.term;
  if (typeof term !== 'undefined') {
    getSuggestions(term.toLowerCase(), res);
  } else {
    res.json({ error: 'No Terms Were Provided' });
  }
});

app.listen(8030, () => console.log('Example app listening on port 8030!'));
