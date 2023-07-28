const client = require('./../utils/twitterClient');

exports.verifyME = async (req, res) => {
    try{
      const followers = await client.v1.verifyCredentials();
      res.status(200).json(followers);
    } catch (error) {
      console.error('Error retrieving saved tweets:', error);
      res.status(error.code).json({ message: error.detail });
    }
  };