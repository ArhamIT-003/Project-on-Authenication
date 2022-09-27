//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(session({
  secret: 'Secrets',
  resave: false,
  saveUninitialized: false,
}));

////              Initialize the Passport   //////

app.use(passport.initialize());
app.use(passport.session());




///               Connection of Database Mongoose //////

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = mongoose.model("User", userSchema);

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

passport.serializeUser((user, done)=>{
  done(null, user.id);
});
passport.deserializeUser((id, done)=>{
  User.findById(id, (err, user)=> {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);

    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

///               GET route              /////
app.get("/", (req, res)=>{
  res.render("home");
});

app.get("/register", (req, res)=>{
  res.render("register");
});

app.get("/login", (req, res)=>{
  res.render("login");
});

app.get("/secrets", (req, res)=> {

  User.find({"secret": {$ne: null}}, (err, foundUsers)=>{
    if(err){
      console.log(err);
    } else{
      if(foundUsers){
        res.render("secrets", {userWithSecrets: foundUsers});
      }
    }
  });

});

app.get("/logout", (req, res)=>{
  req.logout(function(err) {
    if (err) { console.log(err); }
    else {res.redirect('/'); }
  });
});

app.get("/submit", (req, res)=>{
  if(req.isAuthenticated()){
    res.render("submit");
  }
  else{
    res.redirect("/login");
  }
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

///               POST route              /////
app.post("/submit", (req, res)=>{

  const submittedSecret = req.body.secret;
  console.log(req.body.secret);

  User.findById(req.user.id, (err, foundUser)=>{
    if(err){
      console.log(err);
    }else{
      if(foundUser)
      {
        foundUser.secret = submittedSecret;
        foundUser.save(()=>{
          res.redirect("/secrets");
        });
      }
    }
  });
});

app.post("/register", (req, res)=>{

  User.register({username: req.body.username}, req.body.password, (err, user)=>{
    if(err)
    {
      console.log(err);
      res.redirect("/register");
    } else{
      passport.authenticate("local") (req, res, ()=>{
        res.redirect("/secrets");
      });
    }
  });

// const newUser = new User({
//   email: req.body.username,
//   password: req.body.password
// })
// newUser.save((err)=>{
//   if(err){
//     console.log(err);
//   }
//   else{
//     res.render("secrets");
//   }
// })
});

app.post("/login", (req, res)=>{
  const user = new User ({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, (err)=>{
    if(err){
      console.log(err);
      res.redirect("/");
    }
      else{
        passport.authenticate("local")(req, res, ()=>{
          res.redirect("/secrets");
        })
      }
  });
});

app.post("/secrets", (req, res)=>{

});





app.listen(3000, ()=>{
  console.log("Server is running on Port 3000");
})
