
var fs = require('fs');
var monk = require('monk');


var delta = 4;
var filecount = 1;
var filecountmax = delta;

var max = 1634;

var totalstart = new Date().getTime();

storeData(filecount, filecountmax);

function storeData(filecount, filecountmax) {
	var db = monk('localhost/kiva');
	var lenders = db.get('lenders');

	if(filecount == 1) {
		console.log("dropped lenders");
		lenders.drop();
	}

	var completedCount = 0;
	var completedMax = 0;

	var start = new Date().getTime();

	while (filecount <= filecountmax) {
		var obj = JSON.parse(fs.readFileSync('/Users/colin/Downloads/kiva_ds_json/lenders/' + filecount + '.json', 'utf8'));
		obj.lenders.forEach(function(lender) {
			completedMax++;
			lenders.insert(lender, function(err, doc) {
				completedCount++;
				if(completedCount == completedMax) {
					console.log("Closing DB...");
					db.close();
					var end = new Date().getTime();
					var time = end - start;
					var totaltime = end - totalstart;

					console.log(time/1000 + "s taken, total: " + totaltime/1000 + "s taken");
					filecountmax += delta;
					if(filecountmax > max) {
						filecountmax = max
					}
					console.log(filecount + ' ' + filecountmax);
					storeData(filecount, filecountmax);
					return;
				}
			});
		});
		console.log(filecount++ + " files read");
	};
}