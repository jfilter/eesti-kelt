'use strict';

let express = require('express');
let request = require('request');
let cheerio = require('cheerio');
let async = require('async');

const app = express();

const basePage = "<h1>English -> Estonian</h1><form><input name='term'/><input type='submit' value='Search'></form>"

app.get('', function(req, res) {
	const term = req.query.term;
	if (typeof(term) !== 'undefined')
		fetchENtoEST(term, res);
	else
		res.send(basePage);
});

let help = {};
setupHelp(help);

app.listen(3000, () => console.log('Example app listening on port 3000!'));


function fetchENtoEST(term, res) {
	const baseUrlENtoEST = 'http://www.eki.ee/dict/ies/index.cgi?F=M&C06=en&C01=1&C02=1&C13=1&Q=';
	const url = `${baseUrlENtoEST}${term}`;
	request(url, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    return parseENtoEST(body, res, term);
	  }
	});
}

function parseENtoEST(html, res, englTerm) {
	let $ = cheerio.load(html);
	let terms = []
	$('.tervikart').first().find('.x').map((i, e) => {
			const t = e.children[0].data;
			terms.push(t);
		})

	async.map(terms, fetchCompleteEST, function(error, result) {
		let s = `${basePage}<h2>${englTerm}</h2>`;
		for (let i = 0; i < result.length; i++) {
			const o = result[i];
			const notes = o.notes;
			const numbers = o.numbers;
			let examples = '';
			if (numbers) {
				examples = numbers.map(x => {
						if (x !== '') {
							return help[x].base;
						}
					});
			}

			s += `<div><h4>${o.term}</h4>${notes}<br>${examples}</div>`
		}
		res.send(s);
	});
}


function fetchCompleteEST(term, done) {
	const baseUrlCompleteEST = 'http://www.eki.ee/dict/qs/index.cgi?F=M&C02=1&Q=';
	const url = `${baseUrlCompleteEST}${term}`;
	request(url, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    const infos = parseCompleteEST(body);
	    console.log(infos);
	    const result = { notes: infos.notes, numbers: infos.numbers, term: term };
	    done(null, result);
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
