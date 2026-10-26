const express = require("express")

const app = express()

const mongoose = require("mongoose") 

let passport = require('passport');
let session = require('express-session');
let flash = require('connect-flash');


const{ObjectId} = require("mongodb") // works with id 
 
const PORT = process.env.PORT || 3000;

// makes option values 
const makes = [
    "Subaru",
    "Porsche",
    "Toyota",
    "Honda",
    "Ford",
    "Hyundai",
    "Tesla",
    "Jeep",
    "Nissan",
    "Chevrolet",
    "Kia",
    "Mazda",
    "Volkswagen",
    "BMW",
    "Other"
]

require("dotenv").config()
app.use(express.json()) // reads the json content of the req.body
app.use(express.static('public')) // renders static pages 
app.set("view engine","ejs") // for template rendering 
app.use(express.urlencoded({extended:true})) // forms from the frontedn to read it into req.body

app.use(session({ 
    secret: process.env.SESSION_SECRET,
    resave: false, 
    saveUninitialized: false 
}));
app.use(passport.initialize()); // sers passport up/running 
app.use(passport.session()); // looks for saved id from the req.session
app.use(flash()); // message for the login and signup error

require('./config/passport')(passport)

// render landing page
app.get("/",(req,res)=>{
res.render("landing.ejs")
})

//  go to the database then to the collection
//  get the all the documents from the collection(find return cursor object)
//  convert it to array 
//  sort them in descending votes when displayed
//  // render those questions in ejs for template

app.get("/tonight",async(req,res)=>{
    try{
        const logs = await mongoose.connection.db
        .collection("CarCollection")
          // to to specific collections
        .find() // returns cursor object
        .sort({loggedAt:-1}) 
        .toArray() // gives an array 
        res.render("tonight.ejs",{
            logs // render ejs template for the logs array
        })
    }
    catch(err){
        console.log(err)
        res.status(500) 
    }
})

// renders the form for adding car logs 
app.get("/addlog",(req,res)=>{
    res.render("addLog.ejs")
})

// edit route for the edit form 
app.get("/logs/:id/edit",async(req,res)=>{
    try{
    const log = await mongoose.connection.db.collection("CarCollection").findOne({_id:new ObjectId(req.params.id)}) // oen car document where the url matched the ID
    if(!log) return res.redirect("/")
    res.render("editlog.ejs",{log,makes}) // render the edit form (ejs uses both)

    } catch(err){
        console.error("Error loading log for editing", err)
        res.status(500).send("Unable to load log for editing")
    }
})
app.post("/addlog" , async(req,res)=>{
    console.log(req.body)
    try{
        // values the user is only allowded to send
    const { plate,make,model,color,loggedAt , name } = req.body
    const loggedAtDate = new Date(loggedAt)
 
    // building the payload with what the user sends
    const addLogPayLoad = {
        plate,
        name,
        make,
        model,
        color,
        loggedAt: loggedAtDate
    } 
     // insert thq question to the database as record/document id automatically added by mongoDb _id
    await mongoose.connection.db.collection("CarCollection").insertOne(addLogPayLoad)
         res.redirect("/tonight") 

    }  catch(error){
    console.log(error)
    res.status(500).send("Server Error")
    }
})

    // updated existing document from html form
    // id as params -> extract the new values from hthe form
app.post("/logs/:id/edit",async(req,res)=>{
    try{
    const { plate,make,model,color,loggedAt , name } = req.body
    await mongoose.connection.db.collection("CarCollection").updateOne(
        {_id: new ObjectId(req.params.id) } , // find this document
        { $set : {plate,make,model,color,loggedAt: new Date(loggedAt),name} // update these properties of the document 

    })
       res.redirect("/tonight");
    } catch(err){
     console.log(err)
    res.status(500).send("Couldnt save chnages")
    }
})

   
   

app.delete("/nightlog",async(req,res)=>{
    try{
        await mongoose.connection.db.collection("CarCollection").findOneAndDelete({
            _id: new ObjectId(req.body.id)
        })

        res.status(204).end()
    } catch(err) {
        res.status(500).send("Server Error")
    }
})


// =============================================================================
// AUTHENTICATE ==================================================
// =============================================================================

app.get("/login",function(req,res){
    res.render("login.ejs",{message: req.flash("loginMessage")})
})

// Process the login form
app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/tonight',
    failureRedirect: '/login',
    failureFlash: { type: 'loginMessage' }
 }));

// SIGNUP =================================
 app.get('/signup', function(req, res) {
res.render('signup.ejs', { message: req.flash('signupMessage') });
});

// Process the signup form
app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/login',
    failureRedirect: '/signup',
    failureFlash: { type: 'signupMessage' }
 }));


app.listen(PORT,()=>console.log("Connected to port", PORT))
// Connections
 mongoose.connect(process.env.MONGODB_CONNECTIION,{
 }).then(()=>{
    console.log("Connected to the MongodDB")
 }) .catch(err=>console.log("Error connecting to the database",err))
