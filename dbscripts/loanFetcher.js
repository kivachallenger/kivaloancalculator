var request = require('request');
var monk = require('monk');

// Takes a team id and calls a callback with a list of loans
// Caches loans in database
// Limits calls to 60/minute to comply with rate limiting of KIVA ugh..
function getLoans(teamid, maxpages, callback) {
	var start = new Date().getTime();

	var db = monk('172.31.74.98/kiva');
	var teams = db.get('teams');
	var hdi = db.get('hdi');

	// If team exists in database
	teams.find({'_id': teamid}, function(err, doc) {
		// If the teamid doesn't already exist...
		if(doc.length == 0) {
			console.log("success");
			// get all hdi data
			hdi.find({}, function(err, hdidata) {
				hdidata = hdidata[0];

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
						if(maxpages > 0 && maxpages < numpages) {
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
									var loans = obj.loans;
									//console.log("Loans 1-3: ");
									//console.log(loans[0]);
									//console.log(loans[1]);
									//console.log(loans[2]);
									for(var loanindex in loans) {
										console.log(loans[loanindex]);
										// Save this loan to another object
										var l = loans[loanindex];
										// get location
										// get country from location
										var country = l.location.country;
										// get sector
										var sector = l.sector;
										// get the hdisector to use
										var sectorToHDIMap = {
											'Clothing': 'personal',
											'Construction': 'poverty',
											'Education': 'education',
											'Food': 'inequality',
											'Health': 'health',
											'Housing': 'poverty',
											'Manufactoring': 'hdi',
											'Personal Use': 'personal',
											'Retail': 'inequality',
											'Services': 'hdi',
											'Transportation': 'hdi',
											'Wholesale': 'inequality'

										};
										var hdisector = sectorToHDIMap[sector];
										// get impact index from country, hdisector
										var impact_index = -1;
										var hdisecdata = hdidata[hdisector];
										for (var countryIndex in hdisecdata) {
											if(hdisecdata[countryIndex].country == country) {
												impact_index = hdisecdata[countryIndex].impactIndex;
											}
										}
										// get loan amount
										var loan = l.paid_amount;
										if(typeof loan == 'undefined') {
											loan = 0;
										}
										// score from impact index, loan amount
										var score = loan * (1 + impact_index);
										console.log("Score: " + score);
										// set score in loan, then
										loans[loanindex].score = score;
									}

									teams.update(
										{'_id': teamid},
										{'$pushAll': {'loans': loans}}, 
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
			});
			
		} else {
			db.close();
			callback();
		}
	});

	
}

function getLoansForTeam(teamid, pagenumber, callback) {
	request.get('http://api.kivaws.org/v1/teams/' + teamid + '/loans.json?page=' + pagenumber, callback);
}

