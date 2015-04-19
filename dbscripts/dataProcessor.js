

var monk = require('monk');
var db = monk('localhost/kiva');
var loans = db.get('loans');

// Process LOANS
// For each loan
	// For each sector in loan
		// Set score = (1 + impact index) * loanAmount
		// Store back in mongo

// Check out: http://stackoverflow.com/questions/25507866/how-can-i-use-a-cursor-foreach-in-mongodb-using-node-js

var q = async.queue(function (doc, callback) {
  // code for your update
  loans.update({
    _id: doc._id
  }, {
    $set: {
    	// TODO SET THE CHANGE
    }
  }, {
    w: 1
  }, callback);
}, Infinity);

var cursor = loans.find({});
var i = 0;

cursor.each(function(err, doc) {
  if (err) throw err;
  console.log('added to queue');
  if (doc) q.push(doc); // dispatching doc to async.queue
});

q.drain = function() {
  if (cursor.isClosed()) {
    console.log('all items have been processed');
    db.close();
  }
}