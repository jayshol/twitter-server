const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = mongoose.Schema({
	userName: {type: String, required: true, unique:true},
	password: {type: String, required: true},
	following:[{type:Schema.Types.ObjectId, ref:"User"}],
	followers:[{type:Schema.Types.ObjectId, ref:"User"}]
});

userSchema.methods.serialize = function(){
	return {
		userName : this.userName || ''
	};
}
userSchema.methods.validatePassword = function(password){
	return bcrypt.compare(password, this.password);
}

userSchema.statics.hashPassword = function(password){
	return bcrypt.hash(password, 10);
}

const User = mongoose.model("User", userSchema);

module.exports = {User};