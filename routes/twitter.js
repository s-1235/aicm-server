//Importation de Express :
const express = require('express');

//Appel de Express pour crée le router de chaque midellware :
const router = express.Router();

//Importation de fichier user.js de controllers :
const twittertweetControllers = require('../controllers/twittertweet');
const twitterstatsControllers = require('../controllers/twitterstats');
const twitterwelcomingControllers = require('../controllers/twitterwelcoming');
const tweetsAndActivity = require('../controllers/tweetsandActivity');
const SendDirectMessage = require('../controllers/sendMessagetoUser');
const TwitterCRON = require('./../twittercron');
const fetchSavedData = require('./../controllers/fetchSavedData');
const followers = require('./../controllers/pullFollowers');
const verify = require('./../controllers/verifyMe');


//importation du middleware/password :
const auth = require('../middleware/auth');


//Route Twitter Tweet:
router.post('/generate', auth, twittertweetControllers.generateAndPost);

//Route Twitter Stats
router.post('/updateStatsbot', auth, twitterstatsControllers.updateStats);
router.get('/stats', auth, twitterstatsControllers.getStats);
router.get('/interactions', auth, twitterstatsControllers.interactions);

//Route Twitter Welcoming
router.put('/updateMess', auth, twitterwelcomingControllers.updateMess);
router.get('/getWelcoming', auth, twitterwelcomingControllers.getWelcoming);
router.get('/getMess', auth, twitterwelcomingControllers.getMess);
router.get('/tweetsActivity', auth, tweetsAndActivity.getLast100Tweets);
router.post('/sendGroupmessage', auth, SendDirectMessage.sendDirectGroupMessages);
router.post('/sendMessage', auth, SendDirectMessage.sendDirectMessage);
router.post('/sendWelcome', auth, TwitterCRON.sendWelcomeDMs);
router.get('/savedTweets', auth, fetchSavedData.getSavedTweets);
router.get('/savedMostActiveUsers',auth, fetchSavedData.getMostActiveUsers);
router.get('/savedMostActiveUserForATweet/:id', auth, fetchSavedData.getMostActiveUsersForTweet);
router.get('/followers', auth, followers.getFollowers);
router.get('/endfollowers', auth, followers.getTwitterFollowers);
router.get('/verify',auth, verify.verifyME);

//Exportation du fichier user.js de routes :
module.exports = router;