
var fs = require('fs');
var db = require('monk')('localhost/kiva');
var loaners = db.get('loaners');

loaners.drop();

var n = 1;
while (n <= 25) {
	if(n % 25 == 0) {
		console.log(n);
	}
	var obj = JSON.parse(fs.readFileSync('/Users/colin/Downloads/kiva_ds_json/lenders/' + n + '.json', 'utf8'));
	obj.lenders.forEach(function(lender) {
		loaners.insert(lender, function(err, doc) {
			console.log("Inserted " + doc.name + "!");
		});
	});
	n++;
};

db.close();