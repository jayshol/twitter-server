const passport = require('passport');
const express = require('express');
const bodyParser = require('body-parser');
const {Tweet} = require('./models/tweet');

const {router: authRouter, localStrategy, jwtStrategy} = require('./auth');

const router = express.Router();

const jsonParser = bodyParser.json();
passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', {session:false});

router.post('/', jsonParser, (req, res) => {
	const requiredFields = ['tweet_text', 'userName', 'is_tweet', 'is_reply', 'original_tweet_id'];
	for(let i=0;i<requiredFields.length; i++){
		const field = requiredFields[i];
		if(!(field in req.body)){
			const message = `Missing \`${field} \` in request body`;
			console.error(message);
			return res.status(400).send(message);
		}
	}
	const tweetObject = Tweet.create({
		tweet_text : req.body.tweet,
		userName : req.body.userName,
		time_posted : req.body.time,
		is_tweet : req.body.is_tweet,
		is_reply : req.body.is_reply,
		original_tweet_id : req.body.original_tweet_id
	});
	res.status(201).json(tweetObject);
});

module.exports = {router};