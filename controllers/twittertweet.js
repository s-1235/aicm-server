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

// Generate and post function
exports.generateAndPost = (req, res, next) => {
  const tweetContent = req.body.tweetContent;
  // Limit the tweet content to 4000 characters
  const limitedTweetContent = tweetContent.slice(0, 4000);

  // Call OpenAI API to generate tweet
  const prompt = `Generate a tweet about ${limitedTweetContent}.`;
  openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    max_tokens: 300,
    temperature: 0.7
  }).then(response => {
    const generatedTweet = response.data.choices[0].text.trim();

    // Post the generated tweet
    // call the Twitter API to post a tweet with an image
    const imageData = req.body.imageData; // You should handle the image upload and get the image data here
    // Limit the tweet content to 4000 characters
    const limitedTweet = generatedTweet.slice(0, 4000);

    client.v1.tweet('statuses/update', {
      status: limitedTweet,
      media_data: imageData, // Pass the image data here
    }).then((data) => {
      console.log('Tweet posted successfully:', data.text);
      res.status(200).json({ message: 'Tweet posted successfully' });
    }).catch((err) => {
      console.error('Error posting tweet:', err);
      res.status(500).json({ error: 'Failed to post tweet', details: err });
    });

  }).catch(error => {
    console.error(error);
    res.status(500).json({
      message: 'Failed to generate tweet',
      error: error.message
    });
  });
}
