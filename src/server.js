// src/server.js
import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import 'dotenv/config';

const app = express();
// Використовуємо значення з .env або дефолтний порт 3000
const PORT = process.env.PORT ?? 3000;

const testArray = [
  { id: 1, name: 'TEST1' },
  { id: 2, name: 'TEST2' },
];

// Middleware для парсингу JSON
app.use(express.json());

app.use(cors()); // Дозволяє запити з будь-яких джерел

app.use(
  pino({
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
        messageFormat:
          '{req.method} {req.url} {res.statusCode} - {responseTime}ms',
        hideObject: true,
      },
    },
  }),
);

app.post('/users', (req, res) => {
  console.log(req.body); // тепер тіло доступне як JS-об’єкт
  res.status(201).json({ message: 'User created' });
});

// Логування часу
app.use((req, res, next) => {
  console.log(`Time: ${new Date().toLocaleString()}`);
  next();
});

// Перший маршрут
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello world!' });
});

// GET-запит до маршруту "/health"
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'Ok!',
  });
});

// Список усіх користувачів
app.get('/users', (req, res) => {
  res.status(200).json(testArray);
});

// Конкретний користувач за id
app.get('/users/:userId', (req, res) => {
  const { userId } = req.params;
  res.status(200).json({
    id: Number(userId),
    name: testArray.find((user) => user.id === Number(userId)).name,
  });
});

// Маршрут для тестування middleware помилки
app.get('/test-error', (req, res) => {
  // Штучна помилка для прикладу
  throw new Error('Something went wrong');
});

// Middleware 404 (після всіх маршрутів)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Middleware для обробки помилок (останнє)
app.use((err, req, res, next) => {
  // console.error('Error:', err.message);
  console.error(err);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(500).json({
    message: isProd
      ? 'Something went wrong. Please try again later.'
      : err.message,
    // error: err.message,
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
