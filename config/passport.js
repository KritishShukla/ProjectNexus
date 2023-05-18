// PassportJS Strategy and Verification Callback functions.

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const bcrypt = require('bcrypt');

const User = require('../config/user');
const Admin = require('../config/admin');
