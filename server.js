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

// TODO: when empty list is created twice it gives error same for question fixed for now by setting name's in question schema unique values to false but its leading to multiple same entries

const questionSchema = new mongoose.Schema({
    topic: { type : String , required : true },
    name: { type : String , unique : false, required : true },
    url: { type : String , required : true },
    solved: { type: Boolean, default: false }
})

const listSchema = new mongoose.Schema({
    listName: { type : String , unique : true, required : true },
    aboutList: { type : String , required : true },
    questionSet: { type : [questionSchema] , unique : true },
    totalQuestions: Number,
    solvedQuestions: Number
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
            List.find({},(e,foundLists)=>{res.render("admin-edit-quest",{allLists: foundLists})})
        } else {
            res.render("lists")
        }
    } else {
        console.log("not authenticated");
        res.redirect("/login")
    }
})

app.get("/admin-edit-quest/:listID",(req,res)=>{
    
    let listId = req.params.listID
    listId = listId.substring(1)

    if(req.isAuthenticated()){
        if(req.user.isAdmin){
            List.findOne(
                {_id: listId}
            )
            .populate("questionSet")
            .exec(
                (e,foundlist)=>{
                    if(e){
                        console.log(e);
                        res.redirect("/admin-edit-quest")
                    } else {
                        res.render("admin-edit-quest-listID",{urlParameters: listId, allQuests: foundlist.questionSet})
                    }
                }
            )
        } else {
            res.render("lists")
        }
    } else {
        console.log("not authenticated");
        res.redirect("/login")
    }
})

app.get("/admin-edit-quest/:listID/:questID",(req,res)=>{
    
    let listId = req.params.listID
    listId = listId.substring(1)
    let questId = req.params.questID
    questId = questId.substring(1)

    if(req.isAuthenticated()){
        if(req.user.isAdmin){
            res.render("admin-edit-quest-questID",{urlParameters: listId, questUrlParameters: questId})
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
            List.find({},(e,foundLists)=>{res.render("admin-delete-quest",{allLists: foundLists})})
        } else {
            res.render("lists")
        }
    } else {
        console.log("not authenticated");
        res.redirect("/login")
    }
})

app.get("/admin-delete-quest/:listID",(req,res)=>{
    let listId = req.params.listID
    listId = listId.substr(1)
    if(req.isAuthenticated()){
        if(req.user.isAdmin){
            List.findOne(
                {_id: listId}
            )
            .populate("questionSet")
            .exec(
                (e,foundlist)=>{
                    if(e){
                        console.log(e);
                        res.redirect("/admin-delete-quest")
                    } else {
                        res.render("admin-delete-quest-List",{listID: listId, allQuests: foundlist.questionSet})
                    }
                }
            )
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
            console.log(req.body.listTitle);
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
    })

    const addQuestionTo = req.body.list

    List.findOne({listName: addQuestionTo}, (e,foundList)=>{
        foundList.questionSet.push(quest)
        foundList.save((e)=>{
            if(e){
                console.log(e)
                res.redirect("/admin-create-quests")
            } else {
                console.log("question added to list")
                res.redirect("/admin-create-quests")
            }
        })
    })

})

app.post("/admin-edit-list",(req,res)=>{
    const listName = {listName: req.body.list}
    var editList = {}
    let update = true;

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
        List.findOneAndUpdate(listName,editList,{overwrite: false, useFindAndModify: false},(e,list)=>{
            if(e){
                console.log(e)
                res.redirect("/admin-edit-list")
            } else {
                console.log("edit saved")
                res.redirect("/admin-edit-list")
            }
        })
    }
})

app.post("/admin-edit-quest",(req,res)=>{
    const listId = req.body.listID
    if(listId.length)
    {
        res.redirect("/admin-edit-quest/:" + listId)
    }
    else
    {
        res.redirect("/admin-edit-quest")
    }
})

app.post("/admin-edit-quest/:listID",(req,res)=>{
    
    let list_ID = req.params.listID
    list_ID = list_ID.substring(1)

    const questId = req.body.quest
    
    if(list_ID.length){
        res.redirect("/admin-edit-quest/:" + list_ID + "/:" + questId)
    } else {
        res.redirect("/admin-edit-quest")
    }
})

app.post("/admin-edit-quest/:listID/:questID",(req,res)=>{
    
    // let list_ID = req.params.listID
    let questId = req.params.questID

    function clean(obj) {
        for (var propName in obj) {
          if (obj[propName] === "" || obj[propName] === undefined || obj[propName] === null) {
            delete obj[propName];
          }
        }
        return obj
    }

    var questDetails = req.body
    // console.log(questDetails);
    clean(questDetails)
    // console.log(questId);
    // console.log(req.body);

    // TODO: fix this code and update only fields provided by the form

    List.updateOne(
        {"questionSet._id": questId},
        {
            $set: {
                "questionSet.$": req.body
            }
        },
        {new: true, useFindAndModify: false},
        (e)=>{
            if(e){
                console.log(e);
                res.redirect("/admin-edit-quest")
            } else {
                res.redirect("/admin-edit-quest")
            }
        }
    )
})

app.post("/admin-delete-list",(req,res)=>{
    
    const id = req.body.list

    List.findByIdAndDelete(id,(err,list)=>{
        if (err){
            console.log(err)
            res.redirect("/admin-delete-list")
        } else {
            // console.log("deleted " + list)
            res.redirect("/admin-delete-list")
        }
    })
})

app.post("/admin-delete-quest",(req,res)=>{

    const list_ID = req.body.listID
    
    if(list_ID.length){
        res.redirect("/admin-delete-quest/:" + list_ID)
    } else {
        res.redirect("/admin-delete-quest")
    }
})

app.post("/admin-delete-quest/:listID",(req,res)=>{
    let id = req.params.listID
    id = id.substr(1)
    const list_id = mongoose.Types.ObjectId(mongoose.Types.ObjectId(id))

    List.findByIdAndUpdate({_id: list_id},{
        $pull: { questionSet: {_id: req.body.quest}}
        },
        {useFindAndModify: false},
        (e)=>{
            if(e){
                console.log(e);
                res.redirect("/admin-delete-quest")
            } else {
                // console.log("question deleted");
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

