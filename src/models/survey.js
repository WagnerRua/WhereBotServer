const mongoose = require('../database');

const SurveySchema = new mongoose.Schema({
  info: {
    type: String,
    required: true,
  },
  heatmaps: [{
    type: String,
    required: true,
  }],
  robot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Robot',
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Survey = mongoose.model('Survey', SurveySchema);

module.exports = Survey;