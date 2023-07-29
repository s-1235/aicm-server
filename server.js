const http = require('http');
const app = require('./app');
const cron = require('node-cron');
const {sendWelcomeDMs, fetchStats} = require('./twittercron');
const passport = require('passport');
const { Strategy } = require('@superfaceai/passport-twitter-oauth2');
const session = require('express-session');
const Admin = require('./models/Admin');

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});


passport.use(
  new Strategy(
    {
      clientID: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      clientType: 'confidential',
      callbackURL: `${process.env.BASE_URL}/auth/twitter/callback`,
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
            tokenSecret: tokenSecret
            // email and password would need to be set separately
          });

          newAdmin.save((err) => {
            if (err) {
              console.log(err);
            }
            return done(null, newAdmin);
          });
        }
      })
    }
  )
);

const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const errorHandler = error => {
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
app.use(
  session({ secret: 'keyboard cat', resave: false, saveUninitialized: true })
);

// <5> Start authentication flow
app.get(
  '/auth/twitter',
  passport.authenticate('twitter', {
    // <6> Scopes
    scope: ['tweet.read', 'users.read', 'offline.access'],
  })
);

// <7> Callback handler
app.get(
  '/auth/twitter/callback',
  passport.authenticate('twitter'),
  function (req, res) {
    const userData = JSON.stringify(req.user, undefined, 2);
    res.end(
      `<h1>Authentication succeeded</h1> User data: <pre>${userData}</pre>`
    );
  }
);

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
