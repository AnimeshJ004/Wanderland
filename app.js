if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const mongoose = require("mongoose");
const express = require("express");
const app=express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./util/expressError.js");

const listingRoutes = require("./route/listing.js");
const reviewRoutes = require("./route/review.js");
const userRoutes = require("./route/user.js");
const generalRoutes = require("./route/general.js");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const User = require("./models/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const urldb = process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(urldb);
}

main().then(() => {
    console.log("Connection Successful");

    app.set("views", path.join(__dirname, "views"));
    app.set("view engine", "ejs");
    app.use(express.urlencoded({extended:true}));
    app.use(methodOverride("_method"));
    app.engine("ejs" , ejsMate);
    app.use(express.static(path.join(__dirname , "/public")));
      
    const store= MongoStore.create({
        mongoUrl: urldb,
        crypto:{
            secret: process.env.SECRET
        },
        touchAfter: 24*60*60 // time period in seconds
    });
    store.on("error" , function(e){
        console.log("Session Store Error" , e);
    });

    const sessionOption = {
        store,
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: {
            httpOnly: true,
            // secure:true,
            expires: Date.now() + 1000*60*60*24*7,
            maxAge: 1000*60*60*24*7
        }
    }


    app.use(session(sessionOption));
    app.use(flash());

    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStrategy(User.authenticate())); // authenticate method is added by passportLocalMongoose plugin
    passport.serializeUser(User.serializeUser()); // serializeUser method is added by passportLocalMongoose plugin
    passport.deserializeUser(User.deserializeUser()); // deserializeUser method is added by passportLocalMongoose plugin

    app.use((req,res,next)=>{
        res.locals.success = req.flash("success");
        res.locals.error = req.flash("error");  
        res.locals.currentUser = req.user;
        next();
    });

    // app.get("/demouser" , async(req,res)=>{
    //     const fakeuser = new User({username:"demouser" , email:"student@gmail.com"});
    //     let registeruser= await User.register(fakeuser , "password"); // register method is added by passportLocalMongoose plugin to register a new user with given password
    //     res.send(registeruser);
    // })

    const { HomeList } = require("./controllers/listing.js");

    app.use("/listings", listingRoutes); // all routes in listingRoutes will be prefixed with "/"
    app.use("/listings/:id/reviews", reviewRoutes); // all routes in reviewRoutes will be prefixed with "/"
    app.use("/", userRoutes); // all routes in userRoutes will be prefixed with "/"
    app.use("/", generalRoutes); // general routes like privacy and terms

    // Add route for /home to render Home page
    app.get("/home", HomeList);


    //All get responses
    app.use((req,res,next)=>{
        next(new ExpressError("Page Not Found" , 404));
    }); 

    //Custom Error Handler Middleware
    app.use((err,req,res,next)=>{
        let {message="Something Went Wrong!!" , status=500} = err;
        // res.status(status).send(message);
        res.render("error.ejs" , {err}); 
        
    });   
    app.listen(8080,()=>{
        console.log("Server is listening");
    });
}).catch((err)=>{
    console.log("Database connection failed:", err);
    process.exit(1); // Exit the process if connection fails
});
