const dotenv = require('dotenv');
const { Configuration, OpenAIApi } = require("openai");
const { TwitterApi } = require('twitter-api-v2');

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
const openai = new OpenAIApi(configuration);

// create new Twitter client with authentication credentials
const client = new TwitterApi({
  appKey: process.env.API_KEY_TWITTER,
  appSecret: process.env.API_KEY_SECRET_TWITTER,
  accessToken: process.env.ACCESS_TOKEN_TWITTER,
  accessSecret: process.env.ACCESS_TOKEN_SECRET_TWITTER,
});

// Generate function
exports.generate = (req, res, next) => {
    const tweetContent = req.body.tweetContent;
    // Call OpenAI API to generate tweet
    const prompt = `Generate a tweet about ${tweetContent}.`;
    openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 300,
      temperature: 0.7
    }).then(response => {
      const generatedTweet = response.data.choices[0].text.trim();
  
      // Return generated tweet
      res.status(200).json({
        tweet: generatedTweet
      });
    }).catch(error => {
      console.error(error);
      res.status(500).json({
        message: 'Failed to generate tweet'
      });
    });
  }
    
// Post function
exports.post = (req, res, next) => {
    const tweet = req.body.tweet;
  
    // call the Twitter API to post a tweet
    client.post('statuses/update', {status: tweet}, (err, data, response) => {
      if (err) {
        console.error('Error posting tweet:', err);
        res.status(500).json({error: 'Failed to post tweet'});
      } else {
        console.log('Tweet posted successfully:', data.text);
        res.status(200).json({message: 'Tweet posted successfully'});
      }
    });
}
