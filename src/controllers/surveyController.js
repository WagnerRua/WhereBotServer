const express = require('express');
const multer = require('multer');

const multerConfig = require('../config/multer');
const authMiddleware = require('../middlewares/auth');

const Robot = require('../models/robot');
const Survey = require('../models/survey');

const router = express.Router();

router.post('/index', authMiddleware, async (req, res) => {
  try {
    const { robotID } = req.body;
    const robot = await Robot.findById(robotID);
    const surveysArray = [];

    for (const element of robot.surveys){
      const survey = await Survey.findById(element);
      if(survey)
        surveysArray.push(survey);
    }

    return res.send({ surveysArray });
  } catch (error) {
    return res.status(400).send({ error: 'List suveys error.'});
  }
});

router.post('/new', multer(multerConfig).array("files", 10), async (req, res) => {
  try {
    const { info, robotID } = req.body;

    if(! await Robot.findById(robotID))
      return res.status(400).send({ error: 'Robot does not exists.'}); 

    const survey = await Survey.create({
      info,
      robot: robotID,
      heatmaps: req.files.map(object => { return object.location})
    });

    const robot = await Robot.findByIdAndUpdate(robotID, { $push: { "surveys": survey._id } }, {new: true});

    const socketio = req.app.get('io');
    const sockets = socketio.sockets.sockets;
    for(const socketId in sockets)
    {
      var socket = sockets[socketId]; //loop through and do whatever with each connected socket
      if('userID' in socket){
        if(robot.user == socket.userID){
          socket.emit(`${socket.userID}-survey`, {survey});
        }
      }
    }

    return res.send({survey, robot});
  } catch (error) {
    console.log(error);
    return res.status(400).send({ error: 'Registration of survey failed. Are you sure this robot exists?'});
  }
});

router.delete('/delete/:surveyID', authMiddleware, async (req, res) => {
  try {
    const { surveyID } = req.params;
    const survey = await Survey.findByIdAndDelete(surveyID);
    const robot = await Robot.findById(survey.robot);

    const index = robot.surveys.indexOf(surveyID);
    if (index > -1) {
      robot.surveys.splice(index, 1);
      robot.save();
    }

    return res.send({survey});
  } catch (error) {
    return res.status(400).send({ error: 'Delete of survey failed.'});
  }
});

module.exports = app => app.use('/survey', router);