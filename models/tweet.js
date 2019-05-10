const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const tweetSchema = mongoose.Schema({	
	userName: {type:String, required:true},
	tweet_text:{type:String, required:true},
	time_posted:{type:Date, required:true},
	is_tweet:{type:Boolean, required:true},
	is_reply:{type:Boolean, required:true},
	original_tweet_id:{type:Number}
});

tweetSchema.plugin(AutoIncrement, {inc_field: 'tweet_id'});



const Tweet = mongoose.model("Tweet", tweetSchema);
module.exports = {Tweet};