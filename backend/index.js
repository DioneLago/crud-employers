const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const employerRoutes = require('./routes/employerRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3800;

const LOCALHOST_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

app.use(cors({
  origin(origin, callback) {
    if (!origin || LOCALHOST_REGEX.test(origin)) return callback(null, true);
    callback(new Error('Origem não permitida pelo CORS.'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use('/', healthRoutes);
app.use('/auth', authRoutes);
app.use('/employers', employerRoutes);

app.use((req, res) => res.status(404).json({ message: 'Rota não encontrada.' }));
app.use(errorMiddleware);

function buildMongoUri() {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;

  const {
    MONGO_HOST = 'localhost',
    MONGO_PORT = '27017',
    MONGO_DB = 'employers_db',
    MONGO_AUTH_SOURCE = 'admin',
    MONGO_USER,
    MONGO_PASSWORD,
  } = process.env;

  if (MONGO_USER && MONGO_PASSWORD) {
    const user = encodeURIComponent(MONGO_USER);
    const pass = encodeURIComponent(MONGO_PASSWORD);
    return `mongodb://${user}:${pass}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=${MONGO_AUTH_SOURCE}`;
  }

  return `mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`;
}

async function startServer() {
  try {
    await mongoose.connect(buildMongoUri());
    console.log('Conectado ao MongoDB com sucesso.');
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error.message);
    process.exit(1);
  }
}

startServer();
