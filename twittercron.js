const { TwitterApi } = require('twitter-api-v2');
const dotenv = require('dotenv');
const config = require('./config');

const Welcoming = require('./models/Welcoming');
const Stats = require('./models/Stats');


dotenv.config();

const client = new TwitterApi({
  appKey: process.env.API_KEY_TWITTER,
  appSecret: process.env.API_KEY_SECRET_TWITTER,
  accessToken: process.env.ACCESS_TOKEN_TWITTER,
  accessSecret: process.env.ACCESS_TOKEN_SECRET_TWITTER,
});

exports.sendWelcomeDMs = async function () {
  try {
    // Get the list of followers
    const { data: followers } = await client.v2.followers(3165205576, {
      'user.fields': ['username'],
      max_results: 15,
    });
    
    const lastNewUser = await Welcoming.findOne().sort({ $natural: -1 }).exec();
    const lastFollowerId = lastNewUser ? lastNewUser.user : null;

    // Process each follower
    for (const follower of followers) {
      // Check if this follower has already been processed
      if (follower.id == lastFollowerId) {
        break;
      }

      const currentDate = new Date();
      const day = currentDate.getDate();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const hour = currentDate.getHours();
      const minutes = currentDate.getMinutes();

      const formattedDate = `${day}/${month}/${year} ${hour}:${minutes}`;

      const newuser = new Welcoming({
        user: follower.id,
        name: follower.username,
        message: config.welcoming.message,
        date: formattedDate
      });

      newuser.save()
      .then(() => console.log("User saved"))
      .catch(error => console.log("Problem when saving User!:"+error+""));

      // Send a welcome message to the follower
      await client.v2.sendDmToParticipant(follower.id, {
        text: config.welcoming.message,
      });

      // Log the username of the follower
      console.log('Welcome message sent to:', follower.username);
      console.log(follower.id);
    }

    // Update the last processed follower ID
    if (followers.length > 0) {
      lastFollowerId = followers[0].id;
    }

  } catch (error) {
    console.error(error);
  }
};

exports.fetchStats = async function () {
  try {
    if (config.stats.state == 1) {
      console.log("Statistics bot down");
      return
    }

    const meUser = await client.v2.me({ 'user.fields': ['public_metrics'] });

    // Get the user's timeline with the last x tweets
    const { data: timeline } = await client.v2.userTimeline(3165205576, {
      'tweet.fields': ['public_metrics', 'non_public_metrics'],
      max_results: config.stats.max_result,
    });

    // Calculate the total engagement metrics
    let totalLikes = 0;
    let totalComments = 0;
    let totalViews = 0;
    let totalRetweets = 0;
    let sumTweets = timeline.data.length;
    let swaptimeline = timeline 

    //Get the next page
    while (sumTweets < config.stats.max_result) {
      const { data: extendtimeline } = await client.v2.userTimeline(3165205576, {
        'tweet.fields': ['public_metrics', 'non_public_metrics'],
        pagination_token: swaptimeline.meta.next_token
      });
      
      //extend timeline.data with extendtimeline.data
      timeline.data = timeline.data.concat(extendtimeline.data);
      swaptimeline = extendtimeline;
      sumTweets += extendtimeline.data.length
    };

    // Check if the length exceeds config.stats.max_result
    if (timeline.data.length > config.stats.max_result) {
      const itemsToRemove = timeline.data.length - config.stats.max_result;
      timeline.data.splice(config.stats.max_result, itemsToRemove);
    }
    console.log("Number of tweet fetch:", timeline.data.lenght);

    timeline.data.forEach((tweet) => {
      totalLikes += tweet.public_metrics.like_count;
      totalComments += tweet.public_metrics.reply_count;
      totalViews += tweet.non_public_metrics.impression_count;
      totalRetweets += tweet.public_metrics.retweet_count;
    });

    const stats = new Stats({
      followers: meUser.data.public_metrics.followers_count,
      views: totalViews,
      likes: totalLikes,
      comments: totalComments,
      retweets: totalRetweets,
      date: new Date(),
      maxresult: config.stats.max_result
    });

    stats.save()
        .then(() => console.log("Statistics saved"))
        .catch(error => console.log("Problem when saving statistics!:"+error+""));

  } catch (error) {
    console.error("Too much requests!");
  }
};