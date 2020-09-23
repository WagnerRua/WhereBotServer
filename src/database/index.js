const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.set('useFindAndModify', false);
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

module.exports = mongoose;