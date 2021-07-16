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
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true }
})) 

// using passport initializing and session management

app.use(passport.initialize())
app.use(passport.session())

// linking database

mongoose.connect('mongodb://localhost:27017/dsaDB', {useNewUrlParser: true, useUnifiedTopology: true})
mongoose.set("useCreateIndex", true) // ! avoids deprication warning (it was causing issues earlier if any issue found please disable it)

// creating a mongoose schemas

const questionSchema = new mongoose.Schema({
    topic: { type : String , required : true },
    name: { type : String , unique : true, required : true },
    url: { type : String , required : true },
    listid: { type : String , required : true }, 
    solved: { type: Boolean, default: false }
})

const listSchema = new mongoose.Schema({
    listName: { type : String , unique : true, required : true },
    aboutList: { type : String , required : true },
    // questionSet: [questionSchema], // ! probably not needed
    totalQuestions: Number,
    //TODO: solvedQuestions: Number
    //TODO: listRating: Number
})

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    isAdmin: {
        type: Boolean,
        default: false
    }
    //TODO: add -> lists: [listSchema]
})

// adding plugin to userSchema (must be before creating the model and after creating the schema)

userSchema.plugin(passportLocalMongoose)

// creating a mongoose model

const Quest = new mongoose.model("Quest",questionSchema)
const List = new mongoose.model("List",listSchema)
const User = new mongoose.model("User",userSchema)

// passport local config:

passport.use(User.createStrategy())

// serializing and deserializing user:

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// TODO: (improve admin creation and management code!)

 User.countDocuments({},(e,c)=>{
    if(!e){
        if(!c){
            User.register({username: process.env.ADMIN_USERNAME, isAdmin: true},process.env.ADMIN_PASSWORD, (e,user)=>{
                if(e){
                    console.log(e);
                    res.redirect("/signup")
                }
            })
        }
    } else {
        console.log(e)
    }
})

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
        List.find({},(e,foundLists)=>{res.render("lists",{allLists: foundLists})})
    } else {
        console.log("not authenticated");
        res.redirect("/login")
    }
})

app.get("/admin",(req,res)=>{
    if(req.isAuthenticated()){
        if(req.user.isAdmin){
            res.render("admin")
        } else {
            res.redirect("/lists")
        }
    } else {
        console.log("not authenticated");
        res.redirect("/login")
    }
})

app.get("/admin-create-lists",(req,res)=>{
    if(req.isAuthenticated()){
        if(req.user.isAdmin){
            res.render("admin-create-lists")
        } else {
            res.render("lists")
        }
    } else {
        console.log("not authenticated");
        res.redirect("/login")
    }
})

app.get("/admin-create-quests",(req,res)=>{

    if(req.isAuthenticated()){
        if(req.user.isAdmin){
            List.find({},(e,foundLists)=>{res.render("admin-create-quests",{allLists: foundLists})})
        } else {
            res.render("lists")
        }
    } else {
        console.log("not authenticated");
        res.redirect("/login")
    }
})

app.get("/admin-edit-list",(req,res)=>{
    if(req.isAuthenticated()){
        if(req.user.isAdmin){
            List.find({},(e,foundLists)=>{res.render("admin-edit-list",{allLists: foundLists})})
        } else {
            res.render("lists")
        }
    } else {
        console.log("not authenticated");
        res.redirect("/login")
    }
})

app.get("/admin-edit-list",(req,res)=>{
    if(req.isAuthenticated()){
        if(req.user.isAdmin){
            List.find({},(e,foundLists)=>{res.render("admin-edit-list",{allLists: foundLists})})
        } else {
            res.render("lists")
        }
    } else {
        console.log("not authenticated");
        res.redirect("/login")
    }
})

app.get("/admin-edit-quest",(req,res)=>{
    if(req.isAuthenticated()){
        if(req.user.isAdmin){
            Quest.find({},(e,foundLists)=>{res.render("admin-edit-quest",{allQuests: foundLists})})
        } else {
            res.render("lists")
        }
    } else {
        console.log("not authenticated");
        res.redirect("/login")
    }
})

app.get("/admin-edit-quest/:questID",(req,res)=>{
    if(req.isAuthenticated()){
        if(req.user.isAdmin){
            List.find({},(e,foundLists)=>{res.render("admin-edit-quest-QuestID",{urlParameters: req.params.questID, allLists: foundLists})})
        } else {
            res.render("lists")
        }
    } else {
        console.log("not authenticated");
        res.redirect("/login")
    }
})

app.get("/admin-delete-list",(req,res)=>{
    if(req.isAuthenticated()){
        if(req.user.isAdmin){
            List.find({},(e,foundLists)=>{res.render("admin-delete-list",{allLists: foundLists})})
        } else {
            res.render("lists")
        }
    } else {
        console.log("not authenticated");
        res.redirect("/login")
    }
})

app.get("/admin-delete-quest",(req,res)=>{
    if(req.isAuthenticated()){
        if(req.user.isAdmin){
            Quest.find({},(e,foundLists)=>{res.render("admin-delete-quest",{allQuests: foundLists})})
        } else {
            res.render("lists")
        }
    } else {
        console.log("not authenticated");
        res.redirect("/login")
    }
})

app.get("/change-password",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("change-password")
    } else {
        console.log("not authenticated")
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

app.post("/admin-create-lists",(req,res)=>{

    const list = new List({
        listName: req.body.listTitle,
        aboutList: req.body.listDescription
    })

    list.save((e)=>{
        if(e){
            console.log(e)
            res.redirect("/admin-create-lists")
        } else {
            res.redirect("/admin-create-lists")
        }
    })

})

app.post("/admin-create-quests",(req,res)=>{

    const quest = new Quest({
        topic: req.body.topic,
        name: req.body.name,
        url: req.body.url,
        listid: req.body.list
    })

    quest.save((e)=>{
        if(e){
            console.log(e)
            res.redirect("/admin-create-quests")
        } else {
            res.redirect("/admin-create-quests")
        }
    })
})

app.post("/admin-edit-list",(req,res)=>{
    const listName = {listName: req.body.list}
    var editList = {}
    let update = true;
    let updateQuests = false;

    // ! Refactor this code


    if(req.body.listTitle === "" && req.body.listDescription === "")
    {
        update = false;
        res.redirect("/admin-edit-list")
    }
    else if(req.body.listTitle.length > 0 && req.body.listDescription === "")
    {   
        updateQuests = true
        editList = {
            listName: req.body.listTitle
        }
    }
    else if(req.body.listTitle === "" && req.body.listDescription.length > 0)
    {
        editList = {
            aboutList: req.body.listDescription
        }
    }
    else
    {
        updateQuests = true
        editList = {
            listName: req.body.listTitle,
            aboutList: req.body.listDescription
        }
    }

    if(update)
    {
        List.findOneAndUpdate(listName,editList,{overwrite: false},(e)=>{
            if(e){
                console.log(e)
            } else {

                if(updateQuests){
                    Quest.updateMany({listid: req.body.list}, 
                        {listid: req.body.listTitle}, (err, docs) => {
                        if (err){
                            console.log(err)
                        }
                        else{
                            console.log("Updated Docs : ", docs)
                        }
                    });
                }

                console.log("edit saved");
                res.redirect("/admin-edit-list")
            }
        })
    }
})

app.post("/admin-edit-quest",(req,res)=>{
    const questID = req.body.quest
    if(questID.length)
    {
        res.redirect("/admin-edit-quest/:" + questID)
    }
    else
    {
        res.redirect("/admin-edit-quest")
    }
})

app.post("/admin-edit-quest/:questID",(req,res)=>{
    
    var qID = req.params.questID
    qID = qID.substring(1)
    
    // ! not working properly
    Quest.findOneAndUpdate({_id: qID},{$set: req.body},{new: true, useFindAndModify: false},(e)=>{
        if(!e){
            
            console.log("update successful")
            res.redirect("/admin-edit-quest")
        } else {
            console.log(e)
            res.redirect("/admin-edit-quest")
        }
    })
})

app.post("/admin-delete-list",(req,res)=>{
    const id = req.body.list
    List.findByIdAndDelete(id,(err,list)=>{
        if (err){
            console.log(err)
        } else {
            Quest.deleteMany({ listid: list.listName}).then(()=>{
                console.log("Data deleted");
            }).catch((error)=>{
                console.log(error)
            })
            console.log("deleted " + list)
            res.redirect("/admin-delete-list")
        }
    })
})

app.post("/admin-delete-quest",(req,res)=>{
    const id = req.body.quest
    Quest.findByIdAndDelete(id,(err,quest)=>{
        if (err){
            console.log(err)
        } else {
            console.log("deleted " + quest)
            res.redirect("/admin-delete-quest")
        }
    })
})

app.post("/change-password",(req,res)=>{

    User.findByUsername(req.body.name).then((sanitizedUser)=>{
        if (sanitizedUser){
            sanitizedUser.setPassword(req.body.newpwd, (e)=>{
                sanitizedUser.save()
                console.log("password change successful");
                res.redirect("/change-password")
            })
        } else {
            console.log(e)
            res.redirect("/change-password")
        }
    },(err)=>{
        console.error(err)
    })
})

// log-out:

app.get("/logout",(req,res)=>{
    req.logout()
    res.redirect("/")
})

// server management

app.listen(3000,()=>{
    console.log("server up and running at port 3000")
})

