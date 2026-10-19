const fs = require('fs');
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
  }

  const token =
    req.body.token ||
    req.query.token ||
    req.headers['x-access-token'] ||
    req.token;

  if (!token) {
    return res.status(401).json({
      message: 'No token provided.',
    });
  }

  // @todo: we should probably read the contents of the file when we start the server
  // so that we don't have to do expensive disk operations on every request
  const public_key = fs.readFileSync(appRoot + '/../certs/public-key.pem');
  jwt.verify(token, public_key, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        message: 'Failed to authenticate token.',
      });
    }
    req.user = decoded;
    return next();
  });
};

module.exports = verifyToken;