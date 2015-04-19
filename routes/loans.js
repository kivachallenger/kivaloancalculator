var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'TEST router', lender: "Test" });
});

router.get('/*', function(req, res, next) {
  res.render('index', { title: 'TEST router', lender: "Test" });
});

module.exports = router;