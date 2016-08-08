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

// const help = setupHelp();
// });


app.listen(3000, () => console.log('Example app listening on port 3000!'));

const baseUrlENtoEST = 'http://www.eki.ee/dict/ies/index.cgi?F=M&C06=en&C01=1&C02=1&C13=1&Q=';

function fetchENtoEST(term, res){
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
			s += `<div><h4>${o.term}</h4>${o.infos}</div>`
		}
		res.send(s);
	});
}

const baseUrlCompleteEST = 'http://www.eki.ee/dict/qs/index.cgi?F=M&C02=1&Q=';

function fetchCompleteEST(term, done) {
	const url = `${baseUrlCompleteEST}${term}`;
	request(url, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    const infos = parseCompleteEST(body);
	    const result = { infos: infos, term: term };
	    done(null, result);
	  }
	});
}

function parseCompleteEST(html) {
	let $ = cheerio.load(html);
	const t = $('.tervikart').first().find('.grg').text();
	// console.log(t);
	return t;
}

// function setupHelp() {
// 	request('http://www.eki.ee/dict/qs/muuttyybid.html', (error, response, body) => {
// 		if (!error && response.statusCode == 200) {
// 			let help = {};
// 			const $ = cheerio.load(body);
// 			for (let i = 0; i <= 38; i++) {
// 				help[i] = 
// 			}

// 		}
// 	// http://www.eki.ee/dict/qs/muuttyybid.html#22
// }
