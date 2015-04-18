var mongoose = require('mongoose');

var LenderSchema = new mongoose.Schema({
	title: String,
	link: String,
	upvotes: {type: Number, default: 0},
	comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}]
});

PostSchema.methods.upvote = function(callback) {
	this.upvotes++;
	this.save(callback);
};

mongoose.model('Post', PostSchema);