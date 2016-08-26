'use strict';

let express = require('express');
let request = require('request');
let cheerio = require('cheerio');
let async = require('async');
let cors = require('cors');


const app = express();

app.use(cors());

app.get('/eestikelt', function(req, res) {
	const term = req.query.term;
	if (typeof(term) !== 'undefined')
		getSuggestions(term, res);
	else
		res.json({ error: 'fuck off' });
});

let help = {};
setupHelp(help);

app.listen(8030, () => console.log('Example app listening on port 8030!'));

function getSuggestions(term, res) {
	const url = 'http://www.eki.ee/dict/shs_soovita.cgi?D=ies&F=M&term=' + term;
	request(url, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			let suggestions = JSON.parse(body).map(x => {
        const start = x.indexOf('>') + 1;
        const end = x.indexOf('</');
        const s = x.substring(start, end);
        return s;
      });

      if (suggestions.indexOf(term) === -1)
      	suggestions = [term].concat(suggestions);

      console.log('found suggestions');
      console.log(suggestions);

			async.map(suggestions, fetchENtoEST, function(error, result) {
				if (!error) {
					const filtered = result.filter(x => x.list.length > 0)
					res.json(filtered);
				} else {
					res.status(500).send(error);
				}
			});
		}
	});
}

function fetchENtoEST(englTerm, done) {
	const url = 'http://www.eki.ee/dict/ies/index.cgi?F=M&C06=en&C01=1&C02=1&C13=1&Q=' + englTerm;
	request(url, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
			parseENtoEST(body, englTerm, done);
		} else {
			done(error);
		}
	});
}

function parseENtoEST(html, englTerm, done) {
	let $ = cheerio.load(html);
	let terms = []
	$('.tervikart').first().find('.x').map((i, e) => {
			const t = { estTerm: e.children[0].data, englTerm: englTerm };
			terms.push(t);
		})

	return async.map(terms, fetchCompleteEST, function(error, result) {
		if (!error) {
			// IDK if filtering is important.
			// const filtered = result.filter(x => 'notes' in x || 'example' in x);
			const filtered = result;
			done(null, { englTerm: englTerm, list: filtered });
		} else {
			done(error);
		}
	});
}


function fetchCompleteEST(term, done) {
	const url = 'http://www.eki.ee/dict/qs/index.cgi?F=M&C02=1&Q=' + term.estTerm;
	request(url, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    const infos = parseCompleteEST(body);
	    let result = { estTerm: term.estTerm };
	    // let result = { estTerm: term.estTerm, englTerm: term.englTerm };

	    if (infos.notes !== '') {
	    	result.notes = infos.notes;
	    }

	    const numbers = infos.numbers;
	    let example = '';
	    if (numbers && numbers[0] !== '') {
	    	example = numbers.map(x => {
	    			if (x !== '' && x in help) {
	    				return help[x].base;
	    			}
	    		});
	    	result.example = example;
	    }
	    done(null, result);
	  } else {
	  	done(error);
	  }
	});
}

function parseCompleteEST(html) {
	let $ = cheerio.load(html);
	const notes = $('.tervikart').first().find('.grg .mvq').text();
	const numbers = $('.tervikart').first().find('.grg .mt a').text().split();
	return { notes: notes, numbers: numbers };
}

function setupHelp(help) {
	request('http://www.eki.ee/dict/qs/muuttyybid.html', (error, response, body) => {
		if (!error && response.statusCode == 200) {
			const $ = cheerio.load(body);
			const rows = $('table td > span[class=nr]').each(function(i, e) {
					const number = $(this).text().trim();
					const row = $(this).parent().parent();
					const base = row.find('td:nth-child(2)').text().trim();

					let result = { base: base };

					const nextRow = row.next().text();
					const marker = 'võrdlus:';
					const indexOfMarker = nextRow.indexOf(marker);
					if (indexOfMarker >= 0) {
						const additional = nextRow.substring(indexOfMarker + marker.length).trim();
						result.additional = additional;
					}
					help[number] = result;
				});
		}
	});
}
