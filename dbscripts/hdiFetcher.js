var request = require('request');
var monk = require('monk');

var db = monk('localhost/kiva');
var hdi = db.get('hdi');

hdi.drop();

hdiTable = [
	'gender', 
	"http://data.undp.org/resource/me25-gsuv.json",
	'poverty',
	 "http://data.undp.org/resource/frx9-rb5i.json",
	'hdi',
	 "http://data.undp.org/resource/myer-egms.json",
	'education',
	 "http://data.undp.org/resource/xn26-t7qa.json",
	'inequality', 
	"http://data.undp.org/resource/n8fa-gx39.json",
	'health',
	"http://data.undp.org/resource/qdu3-trb6.json",
	'personal',
	"http://data.undp.org/resource/p79w-icq5.json"
]
var count = 0;

hdi.insert({'gender': [], 'poverty': [], 'hdi': [], 'education': [], 'inequality': [], 'health' : [], 'personal' : []}, function(err, doc) {
	get(0);
});


function get(index) {
	request.get(hdiTable[index + 1], function(err, response, body) {

		if (err) throw err;

		if (typeof body != 'undefined') {
			var hdidata = JSON.parse(body);
			if (typeof hdidata[0] != 'undefined') {
				
				processHDI(hdidata, hdiTable[index], function(data) {
					console.log(data);
					var obj = {$pushAll: {}};
					obj.$pushAll[hdiTable[index]] = data;
					console.log(obj);
					hdi.update({}, obj, function(err, doc) {
						count++;
						// console.log(doc);
						console.log(count + ' ' + Object.keys(hdiTable).length)/2;
						if(count == Object.keys(hdiTable).length/2) {
							db.close();
						}
						if(count < 7)
							get(index + 2);
					});
				});

			} else {
				throw new Error(hdiTable[index] + ' did not return data');
			}
		}

	});
}

function processHDI(hdidata, type, callback) {
	console.log(type);
	for(var i = 0; i < hdidata.length; i++) {
		var percent = -1;
		var d = hdidata[i];
		if(typeof hdidata != 'undefined') {
			switch(type) {
				case 'gender':
					if(typeof d['human_development_index_value_female_2013'] != 'undefined')
						percent = (1 - d['human_development_index_value_female_2013']/100.0);
					break;
				case 'poverty':
					if(typeof d['multidimensional_poverty_index_value_specifications_2010'] != 'undefined')
						percent = (1 - d['multidimensional_poverty_index_value_specifications_2010']);
					break;
				case 'hdi':
					if(typeof d['_2013_hdi_value'] != 'undefined')
						percent = (1 - d['_2013_hdi_value']);
					break;
				case 'education':
					if(typeof d['population_with_at_least_some_secondary_education_aged_25_and_above_2005_2012'] != 'undefined' && typeof d['primary_school_dropout_rates_of_primary_school_cohort_2003_2012'] != 'undefined')
						percent = (1 - d['population_with_at_least_some_secondary_education_aged_25_and_above_2005_2012']/100.0) * (1 - d['primary_school_dropout_rates_of_primary_school_cohort_2003_2012']/100.0);
					break;
				case 'inequality':
					if(typeof d['_2013_inequality_adjusted_hdi_ihdi_value'] != 'undefined')
						percent = (1 - d['_2013_inequality_adjusted_hdi_ihdi_value']);
					break;
				case 'health':
					if(typeof d['health_expenditure_out_of_pocket_of_total_expenditure_2011'] != 'undefined')
						percent = (d['health_expenditure_out_of_pocket_of_total_expenditure_2011']/100);
					break;
				case 'personal':
					if(typeof d['perceptions_of_individual_well_being_overall_life_satisfaction_index_0_least_satisfied_10_most_satisfied_2007_2012'] != 'undefined')
						percent = (d['perceptions_of_individual_well_being_overall_life_satisfaction_index_0_least_satisfied_10_most_satisfied_2007_2012']/10);
					break;
				default:
					console.log('Missing value in map');
			}
		}
		//console.log('processed ' + type + ' to ' + percent + ' typeof hdidata is ' + typeof hdidata);
		hdidata[i].impactIndex = percent;
	}
	callback(hdidata);
}





