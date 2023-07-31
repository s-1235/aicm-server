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
  bearerToken: process.env.TWITTER_BEARER_TOKEN
});

const rwClient = client.readWrite;

// Generate and post function
exports.generateAndPost = async (req, res, next) => {
  try {
    const tweetContent = req.body.tweetContent;
    const file = req.files[0];

    // Call OpenAI API to generate tweet
    const prompt = `Generate a tweet about ${tweetContent}.`;
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 300,
      temperature: 0.7
    });
    const generatedTweet = response.data.choices[0].text.trim();

    // Post the generated tweet
    // call the Twitter API to post a tweet with an image
    // Limit the tweet content to 4000 characters
    const limitedTweet = generatedTweet.slice(0, 4000);

    let tweetParameters = { text: limitedTweet };
    if (file) {
      const imagePath = file.path;
      const mediaId = await client.v1.uploadMedia(imagePath);
      tweetParameters.media = { media_ids: [mediaId] };
    }

    const data = await rwClient.v2.tweet(tweetParameters);

    console.log('Tweet posted successfully:', data.text);
    res.status(200).json({ 
      message: 'Tweet posted successfully',
      media: tweetParameters.media, 
    });
  } catch (err) {
    console.error('Error:', err);
    let source = 'Unknown source';
    if (err.message.includes('OpenAI')) {
      source = 'OpenAI API';
    } else if (err.message.includes('Twitter')) {
      source = 'Twitter API';
    }
    res.status(500).json({ 
      error: 'Failed operation', 
      details: err, 
      source: source 
    });
  }
}


