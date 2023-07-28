const mongoose = require('mongoose');

// Define the schema for most active users
const mostActiveUserSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  description: {
    type: String,
  },
  profile_image_url: {
    type: String,
  },
  username: {
    type: String,
  },
  name: {
    type: String,
  },
  score: {
    type: Number,
  },
});

// Create and export the MostActiveUser model
const MostActiveUser = mongoose.model('MostActiveUser', mostActiveUserSchema);
module.exports = { MostActiveUser, mostActiveUserSchema};
