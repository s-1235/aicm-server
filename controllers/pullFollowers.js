const { TwitterApi } = require('twitter-api-v2');



exports.getFollowers = async (req, res) => {
  try {
    const { user } = req; // Retrieve the user attached to the request    
    // Set up the client
    const client = new TwitterApi({
      appKey: process.env.API_KEY_TWITTER,
      appSecret: process.env.API_KEY_SECRET_TWITTER,
      accessToken: process.env.ACCESS_TOKEN_TWITTER,
      accessSecret: process.env.ACCESS_TOKEN_SECRET_TWITTER,
    });
    // const followers = await client.v1.userFollowerList({screen_name: 'Sazari2015'});
    // console.log("Verification is here----------->", verify);
    const followers = await client.v2.get(`users/${user.twitterId}/followers`);
    console.log(followers);
    // send the followers as response
    res.status(200).json({ followers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching followers' });
  }
}

