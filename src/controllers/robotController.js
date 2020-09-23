const express = require('express');
const multer = require('multer');

const multerConfig = require('../config/multer');
const authMiddleware = require('../middlewares/auth');

const Robot = require('../models/robot');
const User = require('../models/user');

const router = express.Router();

router.get('/getstate', async (req, res) => {
  try{
    const { key } = req.body;

    const robot = await Robot.findOne({key});

    return res.send({state: robot.state});
  } catch(err) {
    return res.status(400).send({ error: 'Failed to get state.'});
  }
});

router.post('/setstate', async (req, res) => {
  try{
    const { key, state } = req.body;

    if(!["Start", "Doing", "Finished", "Stopped"].includes(state))
      return res.status(400).send({ error: 'Invalid state.'});

    const robot = await Robot.findOne({key});
    robot.state = state;
    robot.save();

    return res.send({robot});
  } catch(err) {
    return res.status(400).send({ error: 'Failed to set state.'});
  }
});

router.get('/heatmaps', authMiddleware, async (req, res) => {
  try{
    const robot = await Robot.findOne({user: req.userId});
    
    return res.send({heatmaps: robot.images});
  } catch(err) {
    return res.status(400).send({ error: 'Failed to get heatmaps.'});
  }
});

router.post('/uploadheatmap', multer(multerConfig).single('file') , async (req, res) => {
  const { key } = req.body;

  const robot = await Robot.findOne({key});
  robot.images.push(req.file.location);
  robot.save();

  return res.send({robot});
});

router.post('/register', authMiddleware,async (req, res) => {
  try{
    const { key } = req.body;

    if(await Robot.findOne({ key }))
      return res.status(400).send({ error: 'Key already exists.'}); 

    const robot = await Robot.create(req.body);
  
    return res.send({ robot });
    
  } catch(err) {
    return res.status(400).send({ error: 'Robot registration failed.'});
  }
});

router.put('/link-key', authMiddleware, async (req, res) => {
  try{
    const { key } = req.body;

    if(await Robot.findOne({user: req.userId, key: key}))
      return res.status(400).send({ error: 'Robot already linked.'}); 

    const robot = await Robot.findOneAndUpdate({key}, {user: req.userId}, {new: true})

    const user = await User.findByIdAndUpdate(req.userId, {robot: robot.id}, {new: true});

    return res.send({ robot: robot, user: user });
    
  } catch(err) {
    return res.status(400).send({ error: 'Key link failed'});
  }
});

module.exports = app => app.use('/robot', router);