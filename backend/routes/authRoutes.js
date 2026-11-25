const express = require('express');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const RevokedToken = require('../models/RevokedToken');
const { authMiddleware, JWT_SECRET } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const expectedUser = process.env.AUTH_USER || 'admin';
  const expectedPassword = process.env.AUTH_PASSWORD || 'admin123';

  if (!username || !password) {
    return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
  }

  if (username !== expectedUser || password !== expectedPassword) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '8h', jwtid: randomUUID() });
  return res.status(200).json({ token, user: { username } });
});

router.post('/logout', authMiddleware, async (req, res, next) => {
  try {
    await RevokedToken.updateOne(
      { token: req.authToken },
      { $set: { expiresAt: new Date(req.user.exp * 1000) } },
      { upsert: true }
    );

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.get('/me', authMiddleware, (req, res) => {
  return res.status(200).json({ user: { username: req.user.username } });
});

module.exports = router;
