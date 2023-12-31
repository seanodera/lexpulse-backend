const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.header('Authorization');

  if(!token) res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const bearer = token.split(' ');

    const bearerToken = bearer[1];

    // Verify token
    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);

    // Add user from payload
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    res.status(403).json({ msg: 'Forbidden' });
  }

}

module.exports = auth;