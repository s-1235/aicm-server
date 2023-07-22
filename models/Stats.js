const mongoose = require('mongoose');

const StatsSchema = mongoose.Schema({
  followers: { type: Number, required: true },
  views: { type: Number, required: true },
  likes: { type: Number, required: true },
  comments: { type: Number, required: true },
  retweets: { type: Number, required: true },
  date: { type: Date, required: true },
  maxresult: { type: Number, required: true }
});

module.exports = mongoose.model('Stats', StatsSchema);