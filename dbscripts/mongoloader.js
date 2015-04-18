
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var url = 'mongodb://localhost:27017/kiva';

MongoClient.connect(url, function(err, db) {
	if(err) throw err;
	console.log("connected to " + url);


	var loaners = db.collection('loaners');

	loaners.drop();
	console.log('loans dropped');

	db.close();
});

var n = 1;
var ndelta = 25;
var nmax = 1634;




function loadNext(n) {
	MongoClient.connect(url, function(err, db) {
		if(err) throw err;


		var loaners = db.collection('loaners');

		while (n % ndelta != 0) {
			var obj = JSON.parse(fs.readFileSync('/Users/colin/Downloads/kiva_ds_json/lenders/' + n + '.json', 'utf8'));
			obj.lenders.forEach(function(lender) {
				loaners.insert(lender);
			});
			n++;
		};
		console.log(n + " loans inserted");

		db.close();
	});
}