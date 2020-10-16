require("dotenv").config()

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors")

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

require('./controllers/authController')(app);
require('./controllers/robotController')(app);
require('./controllers/surveyController')(app);

const server = app.listen(process.env.PORT || 8080);
const io = require("socket.io")(server)

app.set('io', io);

io.on('connection', socket => {

  socket.on('user.id', (data) => {
    socket.userID = data.id;
  });
});

