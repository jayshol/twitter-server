const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const passport = require('passport');
mongoose.Promise = global.Promise;

const {CLIENT_ORIGIN, DATABASE_URL, PORT} = require('./config');
const jsonParser = bodyParser.json();
const {router:userRouter } = require('./userRouter');
const {router:twitterRouter} = require('./twitterRouter');
const {router: authRouter, localStrategy, jwtStrategy} = require('./auth');

const app = express();
app.use(morgan('common'));
app.use(express.json());
app.use(express.static('public'));

app.use(
	cors({
		origin: CLIENT_ORIGIN
	})
);

passport.use(localStrategy);
passport.use(jwtStrategy);
app.use('/api/users/', userRouter);
app.use('/api/auth/', authRouter);
app.use('/api/tweets/', twitterRouter);

const jwtAuth = passport.authenticate('jwt', {session:false});

app.use("*", function(req, res){
	res.status(404).json({message: 'Not Found'});
});

let server;

function runServer(databaseUrl, port = PORT){
	return new Promise((resolve, reject) => {
		mongoose.connect(databaseUrl, err => {
			if(err){
				return reject(err);
			}
			console.log("connected to database");
			server = app.listen(port, () => {
				console.log(`Your app is listening at port ${port}`);
				resolve();
			})
			.on('error', err =>{
				mongoose.disconnect();
				reject(err);
			});
		});
	});
}

function closeServer(){
	return mongoose.disconnect().then(() => {
		return new Promise((resolve, reject) => {
			console.log('Closing server');
			server.close(err => {
				if(err){
					reject(err);
					return;
				}
				resolve();
			});
		});
	});
}

if(require.main === module){
	runServer(DATABASE_URL).catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};