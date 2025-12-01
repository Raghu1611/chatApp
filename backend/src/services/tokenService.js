const jwt = require('jsonwebtoken');
const config = require('../config/env');

function signAccessToken(payload, exp = '15m') {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: exp });
}

function signRefreshToken(payload, exp = '7d') {
  return jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: exp });
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwtRefreshSecret);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
