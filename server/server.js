const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const axios = require('axios');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const crypto = require('crypto');
const sessionSecret = crypto.randomBytes(64).toString('hex');

// Initialize the Express app
const app = express();

// Enable CORS to allow requests from frontend on port 5173
app.use(cors({
  origin: 'http://localhost:5173'
}));

// GitHub OAuth credentials
const GITHUB_CLIENT_ID = 'Ov23liEMqDQFh01PAzHE';
const GITHUB_CLIENT_SECRET = 'f57606acba34e36303879233ab1eb19ef46f2a8a';

// Configure the GitHub strategy for Passport
passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/github/callback" 
}, async function(accessToken, refreshToken, profile, done) {
  try {
    const response = await axios.get(`https://api.github.com/users/sagarjain03/following/bytemait`, {
      headers: { Authorization: `token ${accessToken}` }
    });

    if (response.status === 204) {
      return done(null, profile);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error);
  }
}));

// Serialize and deserialize user for session handling
passport.serializeUser((user, done) => { done(null, user); });
passport.deserializeUser((user, done) => { done(null, user); });

// Use express-session middleware
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true
}));

// Initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Serve static HTML files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Route to start GitHub authentication
app.get('/auth/github', passport.authenticate('github', { scope: ['user:follow'] }));

// Callback route for GitHub authentication
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/unauthorized' }),
  (req, res) => {
    if (req.user) {
      res.redirect('/welcome');
    } else {
      res.redirect('/unauthorized');
    }
  }
);

// Routes for HTML pages
app.get('/welcome', (req, res) => res.sendFile(path.join(__dirname, 'public', 'welcome.html')));
app.get('/unauthorized', (req, res) => res.sendFile(path.join(__dirname, 'public', 'unauthorized.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));

// Start the server on port 3000
app.listen(3000, () => { console.log('Backend running on http://localhost:3000'); });
