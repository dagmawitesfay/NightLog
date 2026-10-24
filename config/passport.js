const LocalStrategy = require('passport-local').Strategy;


const User = require('../app/models/user');

module.exports = function(passport) {


    // create seralizer act as storage tied to browsers cookie . its remebers who this user is using the id
    // runs once only on login
    passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// deseralize rhat runs on every request
// full check of the users in the databse 
   passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});


// startegies for the signup and login 
   passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },

    function(req,email,password,done){
      // find a usxer with this email 
      // databse error -> done(err) responds
      // if the email already exits -> done(message responds)
      // if the user with that email doesnt exits create it using User 
      // then genereateHash(password) for the new created password  

        // find one documebt in the database collection where the credientals.email matches whats typed
        User.findOne({'credentials.email':email}, function(err,user){
            if(err) return done(err)
                if(user){
                    return done(null, false, { message: "That email is already taken." })
                }
                // Create the user
                else{ 
                const newUser = new User()
                  newUser.credentials.email  = email;
                  newUser.credentials.password = newUser.generateHash(password); // use the generateHash function in our user model

                  // save the new USer
                  newUser.save(function(err){
                    if(err) return done(err)

                    return done(null,newUser)
                  })
                }
            })
    }))

       passport.use('local-login', new LocalStrategy({
      
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    }, 
     function(req, email, password, done) { 
     User.findOne({ 'credentials.email' : email }, function(err, user) {
       if (err)
            return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, { message: 'No user found.' });

            if (!user.validPassword(password))
                return done(null, false, { message: 'Oops! Wrong password.' });

              // all is well, return successful user
            return done(null, user);
})
     }))
}
    
