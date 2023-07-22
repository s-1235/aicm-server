const mongoose = require('mongoose');

const userInteractionSchema = mongoose.Schema({
  user: { type: String, required: true, unique: true },
  likes: { type: Number, required: true },
  comments: { type: Number, required: true },
  retweets: { type: Number, required: true },
});

module.exports = mongoose.model('UserInteraction', userInteractionSchema);
