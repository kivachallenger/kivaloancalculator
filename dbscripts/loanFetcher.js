
var request = require('request');
var monk = require('monk');


getLoans(5925, 10, function() {
	console.log("called callback!")
});

// Takes a team id and calls a callback with a list of loans
// Caches loans in database
// Limits calls to 60/minute to comply with rate limiting of KIVA ugh..
function getLoans(teamid, maxpages, callback) {
	console.log("method 3");
	var start = new Date().getTime();

	var db = monk('localhost/kiva');
	var teams = db.get('teams');

	// If team exists in database
	teams.find({'_id': teamid}, function(err, doc) {
		// If the teamid doesn't already exist...
		if(doc.length == 0) {
			console.log("success");
			// get all hdi data
			// TODO then

			teams.insert({'_id': teamid, loans: []}, function(err, doc) {
				// Find out how many loans the team has made
				getLoansForTeam(teamid, 1, function(err, response, data) {
					console.log("RESPONSE");
					console.log(response.headers);
					if(response.statusCode != 200) {
						console.log("ERROR: CODE " + response.statusCode);
						return;
					}

					var obj = JSON.parse(data);
					
					var numpages = obj.paging.pages;
					var pagesComplete = 0;

					var page = 1;

					if(numpages == 0) {
						db.close();
						callback();
					}

					// Check if a page limit was passed
					if(maxpages > 0) {
						numpages = maxpages;
					}



					var timeout = setInterval(function() {
						if(page > numpages) {
							clearInterval(timeout);
						}
						getLoansForTeam(teamid, page, function(err, response, data) {
							console.log("RESPONSE");
							console.log(response.headers);
							if(response.statusCode != 200) {
								console.log("ERROR: CODE " + response.statusCode);
							} else {
								var obj = JSON.parse(data);

								// for each loan in obj,
									// get location
									// get country from location
									// get sector
									// get impact index from country, sector
									// get loan amount
									// score from impact index, loan amount
									// set score in loan, then

								teams.update(
									{'_id': teamid},
									{'$pushAll': {'loans': obj.loans}}, 
									function(err, doc) {
										pagesComplete++;
										if(pagesComplete == numpages) {
											// All of the teams loans are stored in the database
											db.close();
											callback();
											//console.log(time/1000 + "s passed");
										}
									});
							}
						});
						page++;
					}, 1200);
				});
			});
		} else {
			db.close();
			callback();
		}
	});

	
}

function getLoansForTeam(teamid, pagenumber, callback) {
	request.get('http://api.kivaws.org/v1/teams/' + teamid + '/loans.json?pagenumber=' + pagenumber, callback);
}

