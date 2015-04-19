// Get Quandl data
// For 
	// Store in mongo for each country

var Quandl = require('quandl');
var quandl = new Quandl({
	access_token: 'z8Tvuz7DKzpvt7goEYXx'
});

var monk = require('monk');
var db = monk('localhost/kiva');
var quandl = db.get(quandl);


quandl.dataset({ source: "WORLDBANK", table: "AFG_NV_AGR_TOTL_ZS,ALB_NV_AGR_TOTL_ZS" }, function(err, response){
    if(err)
        throw err;
 
    console.log(response);
    db.close();
});

