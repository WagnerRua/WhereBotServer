const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if(!authHeader)
    return res.status(401).send({ erro: "No token provided" });

  const parts = authHeader.split(" ");

  if(! parts.lenght === 2)
    return res.status(401).send({ erro: "Token error" });

  const [ scheme, token] = parts;

  if(!/^Bearer$/i.test(scheme))
    return res.status(401).send({ erro: "Token malformatted" });

  jwt.verify(token, process.env.SECRET, (err, decoded) =>{
    if(err)
      return res.status(401).send({ erro: "Token invalid" });

    req.userId = decoded.id;
    return next();
  });

};