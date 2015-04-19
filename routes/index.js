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


      var db = monk('172.31.74.98/kiva');
      var teamloans = db.get('teams');

      teamloans.find({_id: lenderID["teams"][0]["id"], sector: {$not: {$size: 0}}}, function(err, docs) {
        if(err) throw err;

        var loans = docs.loans;
        // Get 10 loans by the team
        var loanssub = loans.slice(0, 10);
        
        var dates = [];

        console.log(loans);

        res.render('index', { title: 'KIVA Impact Calculator', lender: lenderID["teams"][0]["id"], name: lenderID["teams"][0]["name"], dates: [], loans: [] });


        //2015-04-19T00:50:04Z



        db.close();

      });


    }

    


  });
});

module.exports = router;