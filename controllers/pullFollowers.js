const client = require('./../utils/twitterClient');

exports.getFollowers = async (req, res) => {
    try {
    //   const params = {
    //     headers: {
    //         'Authorization': 'Bearer '+ process.env.TWITTER_BEARER_TOKEN,
    //     },
    //     params: {
    //         'user.fields': 'name,username',
    //         'max_results': 5
    //     }   
    // };
      const followers = await client.v1.userFollowerList({screen_name: 'Sazari2015'});
      res.status(200).json(followers);
    } catch (error) {
      console.error('Error retrieving saved tweets:', error);
      res.status(error.code).json({ message: error.detail });
    }
  };