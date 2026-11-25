const mongoose = require('mongoose');

const revokedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  // O MongoDB remove o registro quando o token já não pode mais ser usado.
  expiresAt: { type: Date, required: true, expires: 0 },
});

module.exports = mongoose.model('RevokedToken', revokedTokenSchema);
