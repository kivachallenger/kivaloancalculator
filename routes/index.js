var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'KIVA Impact Calculator' });
});

router.get('/*', function(req, res, next) {
  request.get("http://api.kivaws.org/v1/teams/search.json?sort_by=member_count&q=" + req.params[0], function(err, response, body) {
    if (err) {
      res.render('index', { title: 'KIVA Impact Calculator', lender: "ERROR", name: "ERROR" });
    }

    var lenderID = JSON.parse(body);

    if (lenderID["teams"].length == 0) {
      res.render('index', { title: 'KIVA Impact Calculator', lender: "ERROR", name: "ERROR" });
    } else {
      res.render('index', { title: 'KIVA Impact Calculator', lender: lenderID["teams"][0]["id"], name: lenderID["teams"][0]["name"] });
    }

      


  });
});

module.exports = router;