
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
// user lives here
const userSchema = mongoose.Schema({
    credentials:{
        email : String,
        password : String
    }

})

//  passowrd - > hash conversioh
// its done only once(only one way)
// use genSaltSync // generate a random random unique string for the password
userSchema.methods.generateHash = function(password){
    return bcrypt.hashSync(password,bcrypt.genSaltSync(8),null)
}

// When a user tries to log in, Passport captures their username and login password using a local strategy. 
// Passport uses bcrypt.compare() to check if the incoming password matches the hash saved in the database
userSchema.methods.validPassword=function(passowrd){
    return bcrypt.compareSync(passowrd,this.credentials.password)
}

module.exports = mongoose.model("User",userSchema)