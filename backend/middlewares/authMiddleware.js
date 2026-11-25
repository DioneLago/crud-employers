const jwt = require('jsonwebtoken');
const RevokedToken = require('../models/RevokedToken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || !JWT_SECRET.trim()) {
  throw new Error('A variável JWT_SECRET deve ser configurada no ambiente antes de iniciar a API.');
}

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token de autenticação não informado.' });
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Formato do token inválido. Use Bearer <token>.' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }

  try {
    if (await RevokedToken.exists({ token })) {
      return res.status(401).json({ message: 'Sessão encerrada. Entre novamente.' });
    }

    req.authToken = token;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = { authMiddleware, JWT_SECRET };
