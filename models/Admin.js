const mongoose = require('mongoose');

const adminSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  twitterId: { type: String }, // You may want to save twitterId as well
  token: { type: String }, // Twitter Access Token
  tokenSecret: { type: String } // Twitter Token Secret
});

module.exports = mongoose.model('Admin', adminSchema);
