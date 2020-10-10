const express = require('express');
const multer = require('multer');

const multerConfig = require('../config/multer');
const authMiddleware = require('../middlewares/auth');

const Robot = require('../models/robot');
const User = require('../models/user');

const router = express.Router();

router.get('/getstate', async (req, res) => {
  try{
    const { robotID } = req.body;

    const robot = await Robot.findById(robotID);

    return res.send({state: robot.state});
  } catch(err) {
    return res.status(400).send({ error: 'Failed to get state.'});
  }
});

router.post('/setstate', async (req, res) => {
  try{
    const { robotID, state } = req.body;

    if(!["Start", "Doing", "Finished", "Stopped"].includes(state))
      return res.status(400).send({ error: 'Invalid state.'});

    const robot = await Robot.findByIdAndUpdate(robotID, {state}, {new: true});

    const socketio = req.app.get('io');
    const sockets = socketio.sockets.sockets;
    for(const socketId in sockets)
    {
      var socket = sockets[socketId]; //loop through and do whatever with each connected socket
      if('userID' in socket)
        if(robot.user == socket.userID)
          socket.emit(`${socket.userID}-robot-state`, {robot});
    }

    return res.send({robot});
  } catch(err) {
    return res.status(400).send({ error: 'Failed to set state.'});
  }
});

router.post('/register', async (req, res) => {
  try{
    const robot = await Robot.create(req.body);
  
    return res.send({ robot });
    
  } catch(err) {
    return res.status(400).send({ error: 'Robot registration failed.'});
  }
});

router.put('/link-key', authMiddleware, async (req, res) => {
  try{
    const { robotID } = req.body;

    if(await Robot.findOne({user: req.userId, _id: robotID}))
      return res.status(400).send({ error: 'Robot already linked.'}); 

    const robot = await Robot.findOneAndUpdate({_id: robotID}, {user: req.userId}, {new: true})

    const user = await User.findByIdAndUpdate(req.userId, { $push: { "robots": robotID } }, {new: true});

    const socketio = req.app.get('io');
    const sockets = socketio.sockets.sockets;
    for(const socketId in sockets)
    {
      var socket = sockets[socketId]; //loop through and do whatever with each connected socket
      if('userID' in socket)
        if(robot.user == socket.userID)
          socket.emit(`${socket.userID}-robot`, {robot});
    }

    return res.send({ robot: robot, user: user });
  } catch(err) {
    return res.status(400).send({ error: 'Key link failed'});
  }
});

router.post('/userrobots', authMiddleware, async (req, res) => {
  try {
    const { userID } = req.body;
    const robots = await Robot.find({user: userID});
    return res.send({robots});
  } catch (error) {
    return res.status(400).send({ error: 'Error getting robots.'});
  }
})

module.exports = app => app.use('/robot', router);