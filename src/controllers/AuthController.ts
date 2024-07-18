import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { check, validationResult } from 'express-validator';
import User from '../models/User';

const secret = process.env.JWT_SECRET || 'supersecret'; // Используем переменную окружения для секрета JWT

class AuthController {
  // Обработчик регистрации пользователей
  public async register(req: Request, res: Response): Promise<Response> {
    try {
      // Валидация данных запроса
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;

      // Проверка, существует ли уже пользователь с таким именем
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Хеширование пароля
      const hashedPassword = await bcrypt.hash(password, 10);

      // Создание пользователя в базе данных
      const newUser = await User.create({ username, password: hashedPassword });

      // Генерация JWT
      const token = jwt.sign({ userId: newUser.id }, secret, {
        expiresIn: '1h',
      });

      // Отправка httpOnly куки с токеном
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 3600000, // Время жизни куки в миллисекундах (здесь 1 час)
      });

      // Возвращаем созданного пользователя и токен
      return res.status(201).json({ user: newUser });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to register user' });
    }
  }

  // Обработчик входа пользователя
  public async login(req: Request, res: Response): Promise<Response> {
    try {
      // Валидация данных запроса
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { username, password } = req.body;

      // Поиск пользователя в базе данных
      const user = await User.findOne({ where: { username } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Сравнение паролей
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Генерация JWT
      const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' });

      // Отправка httpOnly куки с токеном
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 3600000, // Время жизни куки в миллисекундах (здесь 1 час)
      });

      // Возвращаем ответ без токена
      return res.status(200).json({ user });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to log in' });
    }
  }
}

export default new AuthController();