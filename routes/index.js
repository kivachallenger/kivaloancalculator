var express = require('express');
var router = express.Router();
var request = require('request');
var monk = require('monk');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'KIVA Impact Calculator', lender: "ERROR" });
});

router.get('/*', function(req, res, next) {

  request.get("http://api.kivaws.org/v1/teams/search.json?sort_by=member_count&q=" + req.params[0], function(err, response, body) {
    if (err) {
      res.render('index', { title: 'KIVA Impact Calculator', lender: "ERROR", name: "ERROR", query_message: "ERROR: FAILED TO MAKE KIVA API CALL" });
    }

    var lenderID = ""

    if (typeof body != 'undefined') {
      lenderID = JSON.parse(body);
    }

    if (typeof lenderID["teams"] == 'undefined') {
      res.render('index', { title: 'KIVA Impact Calculator', lender: "ERROR", name: "ERROR", query_message: "ERROR: FAILED TO MAKE KIVA API CALL" });
    } else if (lenderID["teams"].length == 0) {
      res.render('index', { title: 'KIVA Impact Calculator', lender: "ERROR", name: "ERROR", query_message: "ERROR: QUERY IS INVALID" });
    } else {

      getLoans(lenderID["teams"][0]["id"], 2, function() {
        var db = monk('172.31.74.98/kiva');
        var teamloans = db.get('teams');

        teamloans.find({_id: lenderID["teams"][0]["id"]}, function(err, docs) {
            if(err) {

            };

            var loans = docs[0].loans;
            // Get 10 loans by the team
            var loanssub = loans.slice(0, 10);
            
            var dates = [];

            // for (var loan in loanssub) {
            //   dates.push(loanssub[loan]["posted_date"].substring(0,10));
            // }

            // dates = arrayUnique(dates);

            // for (var i = 0; i < dates.length; i++) {
            //   dates[i] = dateToUnix(dates[i]);
            // }

            var unixDates = {};
            // var dummy = "";

            // for (var i = 0; i < dates.length; i++) {
            //   dummy = String(dates[i]);
            //   unixDates[dummy] = 1;
            // }


            var loanPick = loanssub[Math.floor(Math.random() * loanssub.length)];

            if (typeof loanPick == 'undefined') {
              res.render('index', {
                title: "KIVA Impact Calculator",
                lender: "ERROR",
                name: "ERROR",
                borrower: "ERROR",
                sector: "ERROR",
                countryLoan: "ERROR",
                imageLoan: "ERROR",
                funded: "ERROR",
                description: "ERROR",
                heatMap: "ERROR",
                query_message: "ERROR: QUERY IS INVALID"
              });

            } else {
               res.render('index', {
                title: 'KIVA Impact Calculator',
                lender: lenderID["teams"][0]["id"],
                name: errorHandle(lenderID["teams"][0]["name"]), 
                borrower: errorHandle(loanPick["name"]), 
                sector: errorHandle(loanPick["sector"]),
                countryLoan: errorHandle(loanPick["location"]["country"]),
                imageLoan: errorHandle(loanPick["image"]["id"]),
                funded: errorHandle(loanPick["funded_amount"]),
                description: errorHandle(loanPick["use"]),
                heatMap: errorHandle(JSON.stringify(unixDates)) });
            }



            //2015-04-19T00:50:04Z

            db.close();

          });
      
       });

    }

    


  });
});

function errorHandle(term) {
  if (typeof term != 'undefined') {
    return term;
  } else {
    return "ERROR: FAILED TO MAKE KIVA API CALL";
  }
}

function getLoans(teamid, maxpages, callback) {
  console.log("method 3");
  var start = new Date().getTime();

  var db = monk('172.31.74.98/kiva');
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


var dateToUnix = function(a) {
  var dash = a.indexOf('-');
  var datum = new Date(Date.UTC(a.substring(0,dash), a.substring(dash+1, dash+3), a.substring(dash+4, dash+6)));
  return datum.getTime()/1000;
}

var arrayUnique = function(a) {
    return a.reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c);
        return p;
    }, []);
};

module.exports = router;