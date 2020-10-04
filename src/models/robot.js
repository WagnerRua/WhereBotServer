const mongoose = require('../database');

const RobotSchema = new mongoose.Schema({
  model: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    default: 'Stopped', // Start, Doing, Finished, Stopped
    required: true,
  },
  surveys: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    require: true,
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Robot = mongoose.model('Robot', RobotSchema);

module.exports = Robot;