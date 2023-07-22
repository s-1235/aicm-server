const mongoose = require('mongoose');

const WelcomingSchema = mongoose.Schema({
  user: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: String, required: true },
});

module.exports = mongoose.model('Welcoming', WelcomingSchema);