const client = require('./../utils/twitterClient');

exports.getFollowers = async (req, res) => {
    try {
      const followers = await client.v2.followers(process.env.TWITTER_USER_ID, {
        max_results: 5
      });
      res.status(200).json(followers);
    } catch (error) {
      console.error('Error retrieving saved tweets:', error);
      res.status(error.code).json({ message: error.detail });
    }
  };