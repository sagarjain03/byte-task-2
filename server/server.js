import express from 'express';
import passport from 'passport';
import session from 'express-session';
import GitHubStrategy from 'passport-github2';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const OAuth2 = google.auth.OAuth2;

// GitHub OAuth configuration
passport.use(new GitHubStrategy({
  clientID: 'Ov23liEMqDQFh01PAzHE',
  clientSecret: 'f57606acba34e36303879233ab1eb19ef46f2a8a',
  callbackURL: '/auth/github/callback'
},
function(accessToken, refreshToken, profile, done) {
  // Placeholder for actual GitHub follow check
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Middleware setup
app.use(session({
  secret: 'your_secret_key', // Replace with a strong secret key
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// OAuth2 Client setup for YouTube
const oauth2Client = new OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  'http://localhost:3000/auth/youtube/callback'
);

// YouTube API subscription check function
async function checkSubscription(auth, channelId) {
  const youtube = google.youtube('v3');
  const response = await youtube.subscriptions.list({
    part: 'snippet',
    mine: true,
    auth,
  });

  return response.data.items.some(subscription => subscription.snippet.resourceId.channelId === channelId);
}

// GitHub OAuth routes
app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:follow'] })
);

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
  }
);

// YouTube OAuth routes
app.get('/auth/youtube', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/youtube.readonly']
  });
  res.redirect(url);
});

app.get('/auth/youtube/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const isSubscribed = await checkSubscription(oauth2Client, process.env.YOUTUBE_CHANNEL_ID);
    if (isSubscribed) {
      res.redirect('/profile');
    } else {
      res.redirect('/?error=YouTube subscription verification failed');
    }
  } catch (error) {
    res.redirect('/?error=YouTube authentication failed');
  }
});

// Middleware to protect routes
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  res.redirect('/');
}

// Protected route
app.get('/profile', ensureAuthenticated, (req, res) => {
  res.send('Welcome to the private profile page!');
});

// Start server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
