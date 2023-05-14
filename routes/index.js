// Routes for the express app

const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const path = require("path");
const User = require("../config/user");
const ProjectHandler = require("../config/ProjectHandler");
const UserHandler = require("../config/UserHandler");
const Project = require("../config/project")
const event = require("../config/event")


const router = express.Router();

let tvisits = 0;

// Checks if a user/ admin of the provided id exists in Mongo
async function Exists(id) {
  const user = await User.findById(id);
  if (user !== null)
      return true;

  return false;
  // const admin = await Admin.findById(id);
  // return admin !== null;
}

async function Registered(id) {
  const user = await User.findById(id);
  if (user.libid)
      return true;

  return false;
  // const admin = await Admin.findById(id);
  // return admin !== null;
}



// Checks for unauthenticated access to '/' route
async function authManager(req, res, next) {
  if (req.session.passport && (await Exists(req.session.passport.user)))
    res.redirect("/dashboard");
  else res.redirect("/login");
}



router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../pages/landing.html"));
  // console.log("IWOC Landing Sending ",tvisits++);
});

router.get(
  "/dashboard",
  async (req, res, next) => {
    if (req.session.passport && (await Exists(req.session.passport.user)))
      next();
    else res.redirect("/login");
  },
  async (req, res, next) => {
    if (await Registered(req.session.passport.user))
      next();
    else{
      await User.deleteOne({_id:req.session.passport.user});
      res.redirect("/unauthenticated");
    } 
  },
  async (req, res, next) => {
    const user = await User.findById(req.session.passport.user);

    res.render("dashboard", { user: user });
    // console.log("Innogeeks Dashboard Sending", req.session.passport);
  }
);

router.get("/project", async (req, res, next) => {
  const projects = await Project.find();
  res.render("project", {project : projects});
});

router.get("/projects", async (req, res, next) => {
  const projects = await Project.find();
  res.render("project", {project : projects});
});

router.get("/unauthenticated", async (req, res, next) => {
  res.sendFile(path.join(__dirname, "../pages/unauthenticated.html"));
});

router.get(
  "/profile",
  async (req, res, next) => {
    if (req.session.passport && (await Exists(req.session.passport.user)))
      next();
    else res.redirect("/login");
  },
  async (req, res, next) => {
    const user = await User.findById(req.session.passport.user);
    res.render("profile", { user: user });
  }
);

router.get(
  "/login",
  async (req, res, next) => {
    if (req.session.passport && (await Exists(req.session.passport.user)))
      next();
    else res.sendFile(path.join(__dirname, "../pages/login.html"));
  },
  async (req, res, next) => {
    if (await Registered(req.session.passport.user))
      res.redirect("/dashboard");
    else
      next();
  },
  (req, res, next) => {
    res.sendFile(path.join(__dirname, "../pages/login.html"));
    //console.log(req.session.passport);
    // console.log("Innogeeks Login Sending", req.session.passport);
  }
);

router.get(
  "/register",
  async (req, res, next) => {
    if (req.session.passport && (await Exists(req.session.passport.user)))
      next();
    else res.sendFile(path.join(__dirname, "../pages/form.html"));
  },
  async (req, res, next) => {
    if (await Registered(req.session.passport.user))
      res.redirect("/dashboard");
    else
      next();
  },
  (req, res, next) => {
    res.sendFile(path.join(__dirname, "../pages/form.html"));
    // console.log("Innogeeks Register Sending", req.session.passport);
  }
);

router.get("/eventRegistration", (req, res) => {
  res.sendFile(path.join(__dirname, "../pages/event_registration.html"));
})

router.get(
  "/dashboard/leaderboard",
  async (req, res, next) => {
    if (req.session.passport && (await Exists(req.session.passport.user)))
      next();
    else res.redirect("/login");
  },
  async (req, res, next) => {
    if (await Registered(req.session.passport.user))
      next();
    else{
      await User.deleteOne({_id:req.session.passport.user});
      res.redirect("/unauthenticated");
    } 
  },
  async (req, res, next) => {
    const user_t = await User.findById(req.session.passport.user);
    const users = await User.find();
    await users.sort(function(a, b){return b.score - a.score});
    const rank = users.map(e => e.username).indexOf(user_t.username) + 1;
    if(req.query.user){
      const user = await User.findOne({username:req.query.user});
      res.render("history", { user_t:user_t,user: user,rank:rank });
    }
    else{ 
      res.render("leaderboard", { user: user_t,users: users, rank:rank});
    }
    
    // console.log("Innogeeks Dashboard Sending", req.session.passport);
  }
);

// 'Github Oauth' routes for PassportJS github strategy and verification callbacks.

router.get(
  "/auth/github",
  (req, res, next) => {
    // console.log(req.session);
    // console.log(req.user);
    next();
  },
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  async function (req, res) {
    const user = await User.findById(req.session.passport.user);
    const d = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    user.sessions.push({ sessionid: req.sessionID, date: d });
    await user.save();
    // console.log(req.session);
    res.redirect("/dashboard");
  }
);