// requiring all the packages

require("dotenv").config();
const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
// const GoogleStrategy = require('passport-google-oauth20').Strategy
// const findOrCreate = require("mongoose-findorcreate")

// binding app to express fn

const app = express()

// using app

app.use(express.static('public'))
app.set("view engine","ejs")
app.use(bodyParser.urlencoded({extended: true}))

// express session code (must be here before linking database):

app.use(session({
    secret: "our little secret.",
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true }
})) 

// using passport initializing and session management

app.use(passport.initialize())
app.use(passport.session())

// linking database

mongoose.connect('mongodb://localhost:27017/dsaDB', {useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.set("useCreateIndex", true) // avoids deprication warning (its causing issues so disabled it)

// creating a mongoose schema

// const questionSchema = new mongoose.Schema({
//     topic: String,
//     name: String,
//     url: String,
//     solved: Boolean
// })

// const listSchema = new mongoose.Schema({
//     listName: String,
//     aboutList: String,
//     questionSet: [questionSchema],
//     totalQuestions: Number,
//     solvedQuestions: Number
//     //TODO: listRating
// })

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    //TODO: add -> lists: [listSchema]
})

// adding plugin to userSchema (must be before creating the model and after creating the schema)

userSchema.plugin(passportLocalMongoose)

// creating a mongoose model

const User = new mongoose.model("User",userSchema)

// passport local config:

passport.use(User.createStrategy())

// serializing and deserializing user:

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// handling get requests

app.get("/",(req,res)=>{
    res.render("front-page")
})

app.get("/login",(req,res)=>{
    res.render("login-signup",{pageType: "log in", pageAction: "login"})
})

app.get("/signup",(req,res)=>{
    res.render("login-signup",{pageType: "sign up", pageAction: "signup"})
})

app.get("/lists",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("lists")
    } else {
        console.log("not authenticated");
        res.redirect("/login")
    }
})

// handling post requests

app.post("/login",(req,res)=>{
    
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user,(e)=>{
        if(e){
            console.log(e)
            res.redirect("/login")
        } else {
            passport.authenticate("local")(req,res,()=>{
                res.redirect("/lists")
            })
        }
    })

})

app.post("/signup",(req,res)=>{
    User.register({username: req.body.username}, req.body.password, (e,user)=>{
        if(e){
            console.log(e);
            res.redirect("/signup")
        } else {
            passport.authenticate("local")(req,res,()=>{
                res.redirect("/lists")
            })
        }
    })
})

// server management

app.listen(3000,()=>{
    console.log("server up and running at port 3000")
})

// log-out:

// app.get("/logout",(req,res)=>{
//     req.logout()
//     res.redirect("/")
// })