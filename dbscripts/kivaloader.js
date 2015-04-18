
var fs = require('fs');
var db = require('monk')('localhost/kiva');
var loaners = db.get('loaners');


var obj = JSON.parse(fs.readFileSync('/Users/colin/Downloads/kiva_ds_json/lenders/1.json', 'utf8'));
for lender in obj.lenders {

}

