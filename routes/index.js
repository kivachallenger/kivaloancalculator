var express = require('express');
var router = express.Router();
var request = require('request');
var monk = require('monk');
// var loanFetcher = require('../dbscripts/loanFetcher');

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

      // loanFetcher.getLoans(lenderID["teams"][0]["id"], 2, function() {
        var db = monk('172.31.74.98/kiva');
        var teamloans = db.get('teams');

        teamloans.find({_id: lenderID["teams"][0]["id"]}, function(err, docs) {
            if(err) throw err;

            var loans = docs[0].loans;
            // Get 10 loans by the team
            var loanssub = loans.slice(0, 10);
            
            // console.log(loanssub);

            var dates = [];

            for (var loan in loanssub) {
              dates.push(loanssub[loan]["posted_date"].substring(0,10));
            }

            dates = arrayUnique(dates);

            for (var i = 0; i < dates.length; i++) {
              dates[i] = dateToUnix(dates[i]);
            }

            var unixDates = {};
            var dummy = "";

            for (var i = 0; i < dates.length; i++) {
              dummy = String(dates[i]);
              unixDates[dummy] = 1;
            }


            var loanPick = loanssub[Math.floor(Math.random() * loanssub.length)];


            res.render('index', {
                title: 'KIVA Impact Calculator',
                lender: lenderID["teams"][0]["id"],
                name: lenderID["teams"][0]["name"], 
                borrower: loanPick["name"], 
                sector: loanPick["sector"],
                countryLoan: loanPick["location"]["country"],
                imageLoan: loanPick["image"]["id"],
                funded: loanPick["funded_amount"],
                description: loanPick["use"],
                heatMap: JSON.stringify(unixDates) });


            //2015-04-19T00:50:04Z

            db.close();

          });
      
       // });

    }

    


  });
});

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