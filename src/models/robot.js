const mongoose = require('../database');

const RobotSchema = new mongoose.Schema({
  model: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    default: 'Stopped', // Start, Doing, Finished, Stopped
    required: true,
  },
  images: [{
    type: String,
    required: true,
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Robot = mongoose.model('Robot', RobotSchema);

module.exports = Robot;