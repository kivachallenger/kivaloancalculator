var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/*', function(req, res, next) {
  res.render('index', { title: 'KIVA Impact Calculator', lender: "ERROR1" });
});

module.exports = router;