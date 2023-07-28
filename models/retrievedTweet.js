const mongoose = require('mongoose');
const { mostActiveUserSchema } = require('./mostActiveUser');

// Define the schema for tweets
const retrievedTweetSchema = new mongoose.Schema({
  tweetId: {
    type: String,
    required: true,
  },
  text: {
    type: String,
  },
  likes: {
    type: Number,
  },
  replies: {
    type: Number,
  },
  retweets: {
    type: Number,
  },
  mostActiveUser: [mostActiveUserSchema],
}, {
  timestamps: true, // Add createdAt and updatedAt timestamps
});

// Create and export the Tweet model
const RetrievedTweet = mongoose.model('RetrievedTweet', retrievedTweetSchema);
module.exports = RetrievedTweet;
