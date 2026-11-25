function errorMiddleware(err, req, res, next) {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: errors[0] || 'Dados inválidos.', errors });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'ID inválido.' });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  console.error(err);
  return res.status(500).json({ message: 'Erro interno no servidor.' });
}

module.exports = errorMiddleware;
