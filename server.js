const http = require('http');
const express = require('express');
const app = require('./app');
const cron = require('node-cron');
const { sendWelcomeDMs, fetchStats } = require('./twittercron');
const passport = require('passport');
const { Strategy: TwitterStrategy } = require('@superfaceai/passport-twitter-oauth2');
const session = require('express-session');
const Admin = require('./models/Admin');
const { TwitterApi } = require('twitter-api-v2');

// Replace these with your actual keys
const CONSUMER_KEY = process.env.API_KEY_TWITTER;
const CONSUMER_SECRET = process.env.API_KEY_SECRET_TWITTER;
const CALLBACK_URL = 'http://localhost:3000/auth/twitter/callback';

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(
  new TwitterStrategy(
    {
      clientID: CONSUMER_KEY,
      clientSecret: CONSUMER_SECRET,
      callbackURL: CALLBACK_URL,
    },
    (token, tokenSecret, profile, done) => {
      Admin.findOne({ twitterId: profile.id }, (err, admin) => {
        if (err) {
          return done(err);
        }
        console.log('Success!', { token, tokenSecret });
        if (admin) {
          // If the admin already exists, update their tokens
          admin.token = token;
          admin.tokenSecret = tokenSecret;
          admin.save((err) => {
            if (err) {
              console.log(err);
            }
            return done(null, admin);
          });
        } else {
          // This else block might not be required if you don't want to auto-create an admin account
          // Instead, you could return an error if no admin account is found with the Twitter ID
          const newAdmin = new Admin({
            twitterId: profile.id,
            token: token,
            tokenSecret: tokenSecret,
            // email and password would need to be set separately
          });

          newAdmin.save((err) => {
            if (err) {
              console.log(err);
            }
            return done(null, newAdmin);
          });
        }
      });
    }
  )
);

const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const errorHandler = (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

app.use(passport.initialize());
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true }));

// Step 1: Create the auth link
app.get('/auth/twitter', (req, res, next) => {
  const client = new TwitterApi({ appKey: CONSUMER_KEY, appSecret: CONSUMER_SECRET });
  client
    .generateAuthLink(CALLBACK_URL)
    .then((authLink) => {
      req.session.oauth_token = authLink.oauth_token;
      req.session.oauth_token_secret = authLink.oauth_token_secret;
      res.redirect(authLink.url);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Failed to generate auth link.');
    });
});

// Step 2: Handle the callback and exchange temporary tokens for persistent tokens
app.get('/auth/twitter/callback', (req, res, next) => {
  const client = new TwitterApi({
    appKey: CONSUMER_KEY,
    appSecret: CONSUMER_SECRET,
    accessToken: req.session.oauth_token,
    accessSecret: req.session.oauth_token_secret,
  });

  client
    .login(req.query.oauth_verifier)
    .then(({ client: loggedClient, accessToken, accessSecret }) => {
      // Store accessToken & accessSecret somewhere
      // You can access the authenticated user details using `loggedClient`
      const userData = JSON.stringify(loggedClient, undefined, 2);
      res.end(`<h1>Welcome Back</h1> User data: <pre>${userData}</pre>`);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Failed to exchange temporary tokens for persistent tokens.');
    });
});

const server = http.createServer(app);

server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
  // Schedule the sendWelcomeDMs function to run every 15 minutes using cron
  cron.schedule('*/15 * * * *', () => {
    sendWelcomeDMs();
  });

  // Schedule the fetchStats function to run every day at 6pm using cron
  cron.schedule('0 18 * * *', () => {
    fetchStats();
  });
});

server.listen(port);
