const { TwitterApi } = require('twitter-api-v2');
const axios = require('axios');
const OAuth = require('oauth-1.0a');
const CryptoJS = require('crypto-js');
// const client = require('./../utils/openaiClient');

exports.getFollowers = async (req, res) => {
  const client = new TwitterApi({
    appKey: process.env.API_KEY_TWITTER,
    appSecret: process.env.API_KEY_SECRET_TWITTER,
    accessToken: process.env.ACCESS_TOKEN_TWITTER,
    accessSecret: process.env.ACCESS_TOKEN_SECRET_TWITTER,
    bearerToken: process.env.TWITTER_BEARER_TOKEN
  });
  
  const rwClient = client.readWrite;
  try {
    const { user } = req; // Retrieve the user attached to the request    
    // Set up the client
    // const followers = await client.v1.userFollowerList({screen_name: 'Sazari2015'});
    // console.log("Verification is here----------->", verify);
    const followers = await rwClient.v2.following(user.twitterId);
    console.log(followers);
    // send the followers as response
    res.status(200).json({ followers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching followers' });
  }
}

const oauth = OAuth({
    consumer: {
      key: process.env.API_KEY_TWITTER,
      secret: process.env.API_KEY_SECRET_TWITTER,
    },
    signature_method: 'HMAC-SHA1',
    hash_function: (base_string, key) =>
    CryptoJS.HmacSHA1(base_string, key).toString(CryptoJS.enc.Base64),
  });
  
  exports.getTwitterFollowers = async (req, res) => {
    try {
      const accessToken = process.env.ACCESS_TOKEN_TWITTER;
      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET_TWITTER;
      const result = await getFollowers(accessToken, accessTokenSecret, process.env.TWITTER_USER_ID, 5);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  };
  
  const getFollowers = async (accessToken, accessTokenSecret, user_id, max_number) => {
    try {
      const requestData = {
        url: `https://api.twitter.com/2/users/${user_id}/followers`,
        method: 'GET',
      };
  
      // Add OAuth parameters to the request
      const authHeader = oauth.toHeader(oauth.authorize(requestData, { key: accessToken, secret: accessTokenSecret }));
      requestData.headers = {
        ...requestData.headers,
        ...authHeader,
      };
  
      const response = await axios.get(requestData.url, {
        headers: requestData.headers,
        params: {
          'user.fields': 'name,username',
          'max_results': max_number,
        },
      });
  
      return response.data;
    } catch (err) {
      throw err;
    }
  };