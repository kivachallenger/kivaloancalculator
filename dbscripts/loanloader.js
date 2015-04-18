
var fs = require('fs');
var monk = require('monk');


//
var max = 1712;
var type = 'loans';
//


var delta = 4;
var filecount = 1;
var filecountmax = delta;

var totalstart = new Date().getTime();

storeData(filecount, filecountmax);

function storeData(filecount, filecountmax) {
	var db = monk('localhost/kiva');
	var collection = db.get(type);

	if(filecount == 1) {
		console.log("dropped " + type + " collection");
		collection.drop();
	}

	var completedCount = 0;
	var completedMax = 0;

	var start = new Date().getTime();

	while (filecount <= filecountmax) {
		var obj = JSON.parse(fs.readFileSync('/Users/colin/Downloads/kiva_ds_json/' + type + '/' + filecount + '.json', 'utf8'));
		obj[type].forEach(function(item) {
			completedMax++;
			collection.insert(item, function(err, doc) {
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