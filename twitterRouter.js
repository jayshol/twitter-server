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
	const requiredFields = ['tweet_text', 'userName', 'is_tweet', 'is_reply', 'original_tweet_id', 'time_posted'];

	for(let i=0;i<requiredFields.length; i++){
		const field = requiredFields[i];
		if(!(field in req.body)){
			const message = `Missing \`${field} \` in request body`;
			console.error(message);
			return res.status(400).send(message);
		}
	}

	console.log(req.body);
	const tweetObject = Tweet.create({
		tweet_text : req.body.tweet_text,
		userName : req.body.userName,
		time_posted : req.body.time_posted,
		is_tweet : req.body.is_tweet,
		is_reply : req.body.is_reply,
		original_tweet_id : req.body.original_tweet_id
	});
	res.status(201).json(tweetObject);
});

router.get('/:userName', (req, res) => {
	Tweet.find({userName:req.params.userName})
	.then(tweets => res.json(tweets))
	.catch(err => {
		console.log(err);
		res.status(500).json({'error': 'Something went wrong.'});
	});
});

module.exports = {router};