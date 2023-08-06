const dotenv = require('dotenv');
const { interactions } = require('./twitterstats');
const needle = require('needle');
const { MostActiveUser } = require('./../models/mostActiveUser');
const RetrievedTweet = require('./../models/retrievedTweet');
const client = require('./../utils/twitterClient');
const openai = require('./../utils/openaiClient');

dotenv.config();

exports.getLast100Tweets = async (req, res, next) => {
  try {
    // Delete all previous data in both tables
    await MostActiveUser.deleteMany({});
    await RetrievedTweet.deleteMany({});

    const { data: tweets } = await client.v2.userTimeline(process.env.TWITTER_USER_ID, {
      max_results: 5,
      'tweet.fields': 'id,text,public_metrics,referenced_tweets,created_at', // Added created_at
      'user.fields': 'description,username,name,profile_image_url',
    });

    if (!tweets || tweets.length === 0) {
      return res.status(404).json({ error: 'No tweets found.' });
    }

    const tweetDataList = [];
    const mostActiveUserList = [];
    const userparams = {
      "tweet.fields": "lang,author_id",
      "user.fields": "id,description,profile_image_url,username,name",
    };

    for (const tweet of tweets.data) {
      const { id, text, public_metrics, created_at } = tweet;
      const { like_count, reply_count, retweet_count } = public_metrics;

      const likersRes = await client.v2.tweetLikedBy(id, userparams);
      const retweetersRes = await client.v2.tweetRetweetedBy(id, userparams);

      const likers = likersRes?.data;
      const retweeters = retweetersRes?.data;

      const userInteractions = {};

      likers?.forEach(user => {
        userInteractions[user.id] = (userInteractions[user.id] || 0) + 1;
      });

      retweeters?.forEach(user => {
        userInteractions[user.id] = (userInteractions[user.id] || 0) + 2;
      });

      let mostActiveUserIds = [];
      if (Object.keys(userInteractions).length > 0) {
        const highestScore = Math.max(...Object.values(userInteractions));
        mostActiveUserIds = Object.keys(userInteractions).filter(userId => userInteractions[userId] === highestScore);
      }

      const mostActiveUsers = [];

      for (const userId of mostActiveUserIds) {
        const mostActiveUser = likers?.find(user => user.id === userId) || retweeters?.find(user => user.id === userId);
        if (mostActiveUser) {
          const { id, username, description, profile_image_url, name } = mostActiveUser;
          const userScore = userInteractions[userId];
          const userObj = {
            userId: id,
            username,
            description,
            profile_image_url,
            name,
            score: userScore,
          };
          mostActiveUsers.push(userObj);
        }
      }

      const tweetDataItem = {
        tweetId: id,
        text,
        likes: like_count,
        replies: reply_count,
        retweets: retweet_count,
        mostActiveUser: mostActiveUsers.length > 0 ? mostActiveUsers : [],
        createdAt: new Date(created_at) // Setting the createdAt field
      };

      tweetDataList.push(tweetDataItem);
      mostActiveUserList.push(...mostActiveUsers);
    }

    // Save tweet data to DB
    await RetrievedTweet.insertMany(tweetDataList);

    // Save most active user data to DB
    await MostActiveUser.insertMany(mostActiveUserList);

    res.status(200).json(tweetDataList);
  } catch (error) {
    console.error('Error retrieving tweets:', error);
    res.status(500).json({ message: 'An error occurred while retrieving tweets.' });
  }
};
