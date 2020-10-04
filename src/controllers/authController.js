const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Robot = require('../models/robot');

const router = express.Router();

function generateToken(params = {}){
  return jwt.sign(params, process.env.SECRET, {
    expiresIn: 86400,
  });
}


router.post('/register', async (req, res) => {
  const { name, email, password, robotID } = req.body;

  try{
    if(await User.findOne({ email }))
      return res.status(400).send({ error: 'User already exists.'}); 

    const robot = await Robot.findById(robotID);
    if(robot.user != null)
      return res.status(400).send({ error: 'Robot already linked.'}); 

    const user = await User.create({
      name,
      email,
      password,
      robots: [
        robotID
      ],
    });

    robot.user = user._id;
    robot.save();
  
    user.password = undefined;

    return res.send({ user, token: generateToken({ id: user._id }) });
    
  } catch(err) {
    return res.status(400).send({ error: 'Registration failed. Are you sure this robot exists?'});
  }
});

router.post('/authenticate', async (req, res) => {
  const {email, password} = req.body;

  const user = await User.findOne({ email }).select('+password');

  if(!user)
    return res.status(400).send({ error: 'User not found.'});

  if(! await bcrypt.compare(password, user.password))
    return res.status(400).send({ error: 'Invalid password.'});

  user.password = undefined;

  return res.send({ user, token: generateToken({ id: user.id }) });
});

module.exports = app => app.use('/auth', router);