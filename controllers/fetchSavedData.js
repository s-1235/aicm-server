const RetrievedTweet = require('./../models/retrievedTweet'); // replace with your actual model path
const MostActiveUser = require('./../models/mostActiveUser').MostActiveUser; // replace with your actual model path

exports.getSavedTweets = async (req, res) => {
  try {
    const savedTweets = await RetrievedTweet.find().populate('mostActiveUser');
    if (!savedTweets || savedTweets.length === 0) {
      return res.status(404).json({ error: 'No saved tweets found.' });
    }
    res.status(200).json(savedTweets);
  } catch (error) {
    console.error('Error retrieving saved tweets:', error);
    res.status(500).json({ message: 'An error occurred while retrieving saved tweets.' });
  }
};

exports.getMostActiveUsers = async (req, res) => {
  try {
    const activeUsers = await MostActiveUser.find();
    if (!activeUsers || activeUsers.length === 0) {
      return res.status(404).json({ error: 'No active users found.' });
    }
    res.status(200).json(activeUsers);
  } catch (error) {
    console.error('Error retrieving active users:', error);
    res.status(500).json({ message: 'An error occurred while retrieving active users.' });
  }
};

exports.getMostActiveUsersForTweet = async (req, res) => {
  try {
    const tweetId = req.params.tweetId; // assuming route is something like "/tweets/:tweetId/active-users"
    const tweet = await RetrievedTweet.findOne({ tweetId }).populate('mostActiveUser');
    if (!tweet) {
      return res.status(404).json({ error: 'No such tweet found.' });
    }
    const activeUsers = tweet.mostActiveUser;
    res.status(200).json(activeUsers);
  } catch (error) {
    console.error('Error retrieving active users for tweet:', error);
    res.status(500).json({ message: 'An error occurred while retrieving active users for tweet.' });
  }
};
