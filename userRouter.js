const passport = require('passport');
const express = require('express');
const bodyParser = require('body-parser');

const {User} = require('./models/user');
const {router: authRouter, localStrategy, jwtStrategy} = require('./auth');

const router = express.Router();

const jsonParser = bodyParser.json();
passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', {session:false});

router.post('/signup', jsonParser, (req, res) => {
	const requiredFields = ['userName', 'password'];
	console.log(req.body);
	const missingField = requiredFields.find(field => !(field in req.body));

	if(missingField){
		return res.status(422).json({
			code : 422,
			reason : 'ValidationError',
			message : 'Missing field',
			location : missingField
		});
	}

	const stringFields = ['userName', 'password'];
	const nonStringField = stringFields.find(field => !(field in req.body));
	if(nonStringField){
		return res.status(422).json({
			code: 422,
			reason : 'ValidationError',
			message: 'Incorrect field type: expected string',
			location : nonStringField
		});
	}

	const explicitlyTrimmedFields = ['userName', 'password'];
	const nonTrimmedField = explicitlyTrimmedFields.find(
		field => req.body[field].trim() !== req.body[field]
	);

	if(nonTrimmedField){
		return res.status(422).json({
			code: 422,
			reason: 'ValidationError',
			message : 'Cannot start or end with a white space',
			location: nonTrimmedField
		});
	}

	const sizedFields = {
		'userName':{
			min : 3
		},
		'password':{
			min : 3,
			max : 72
	}};

	const tooSmallField = Object.keys(sizedFields).find(
		field => 
			'min' in sizedFields[field] && req.body[field].trim().length < sizedFields[field].min
	);

	const tooLargeField = Object.keys(sizedFields).find(
		field => 
			'max' in sizedFields[field] && req.body[field].trim().length > sizedFields[field].max
	);

	if(tooSmallField || tooLargeField){
		return res.status(422).json({
			code : 422,
			reason : 'ValidationError',
			message : tooSmallField ? `Must be at least ${sizedFields[tooSmallField].min} characters long`
			: `Must be at most ${sizedFields[tooLargeField].max} characters long`,
			location : tooSmallField || tooLargeField
		});
	}

	let {userName, password} = req.body;

	return User.find({userName})
		.count()
		.then(count => {
			if(count > 0){
				return Promise.reject({
					code: 422,
					reason : 'ValidationError',
					message : 'User name already taken',
					location : userName
				});
			}

			return User.hashPassword(password);
		})
		.then(hash => {
			return User.create({
				userName: userName,
				password: hash
			});
		})
		.then(user => {
			return res.status(201).json(user.serialize());
		})
		.catch(err => {
			if(err.reason === 'ValidationError'){
				return res.status(err.code).json(err);
			}
			return res.status(500).json({message: 'Internal server error'});
		});

});

router.delete('/remove/:id', jwtAuth, (req, res) => {		
		User
		.findByIdAndRemove(req.params.id)
		.then(user => res.status(204).end())
		.catch(err => {
			console.log(err);
			res.status(500).json({'error':'Internal server error.'});
		});
});

router.get('/:userName',jwtAuth, (req, res) => {
		User
		.find({userName:req.params.userName})		
		.then(user => res.json(user))
		.catch(err => {
			console.log(err);
			res.status(500).json({'error':'Something went horribly awry.'});
		});
});

router.put('/:id', jwtAuth, (req, res) => {
	if(!(req.params.id && req.body._id && req.params.id === req.body._id)){
		const message = `Request path id (${req.params.id}) and request body id (${req.body._id})
						must match`;
		console.error(message);
		return res.status(400).json({message:message});
	}

	const toUpdate = {};
	const updatableFields = ['solvedPuzzles'];

	updatableFields.forEach(field => {
		if(field in req.body){
			toUpdate[field] = req.body[field];
		}
	});
	//console.log(toUpdate); 
	User
	.findByIdAndUpdate(req.body._id, {$set : toUpdate},{new:true})
	.then(user => res.status(201).json(user))
	.catch(err => res.status(500).json({message:err.message}));

});


module.exports = {router};