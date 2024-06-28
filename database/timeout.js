const mongoose = require('mongoose');

const timeoutSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  timeoutUntil: { type: Date, required: true },
  reason: { type: String, default: 'No reason provided' },
});

module.exports = mongoose.model('Timeout', timeoutSchema);

