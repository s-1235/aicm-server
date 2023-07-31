const { TwitterApi } = require('twitter-api-v2');

const client = new TwitterApi({
    appKey: process.env.API_KEY_TWITTER,
    appSecret: process.env.API_KEY_SECRET_TWITTER,
    accessToken: process.env.ACCESS_TOKEN_TWITTER,
    accessSecret: process.env.ACCESS_TOKEN_SECRET_TWITTER,
    bearerToken: process.env.TWITTER_BEARER_TOKEN
});

module.exports = client.readWrite;