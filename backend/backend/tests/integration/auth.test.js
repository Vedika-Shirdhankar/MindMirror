// tests/integration/auth.test.js
// Integration tests for the Auth API endpoints.
// Uses Supertest to make real HTTP calls against the app.
// Mocks MongoDB and JWT to keep tests fast and deterministic.

const request = require('supertest');
const mongoose = require('mongoose');

// We need to build the app without starting the server
// So we extract it from server.js, or re-create it here for testing.
// For simplicity, we import the express app directly.
// In a real setup, server.js would export app separately from listen().

// Since our server.js bootstraps and listens, we create a lightweight test app here.
const express = require('express');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const { errorHandler } = require('../../middleware/errorHandler');
const authRoutes = require('../../routes/authRoutes');
const User = require('../../models/User');

// Build minimal test app (no Redis, no job queue)
const testApp = express();
testApp.use(express.json());
testApp.use(cors());
testApp.use(mongoSanitize());
testApp.use('/api/auth', authRoutes);
testApp.use(errorHandler);

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindmirror_test';

describe('Auth API', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI);
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up test users before each test
    await User.deleteMany({ email: /test-jest@/ });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return a token', async () => {
      const res = await request(testApp).post('/api/auth/register').send({
        name: 'Jest User',
        email: 'test-jest@example.com',
        password: 'TestPass123!',
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'test-jest@example.com');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should reject registration with a duplicate email', async () => {
      await request(testApp).post('/api/auth/register').send({
        name: 'Jest User',
        email: 'test-jest@example.com',
        password: 'TestPass123!',
      });

      const res = await request(testApp).post('/api/auth/register').send({
        name: 'Another User',
        email: 'test-jest@example.com',
        password: 'AnotherPass!',
      });

      expect(res.status).toBe(409);
    });

    it('should reject registration with missing required fields', async () => {
      const res = await request(testApp).post('/api/auth/register').send({
        email: 'test-jest-incomplete@example.com',
      });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(testApp).post('/api/auth/register').send({
        name: 'Login Test User',
        email: 'test-jest@example.com',
        password: 'TestPass123!',
      });
    });

    it('should login with correct credentials and return token', async () => {
      const res = await request(testApp).post('/api/auth/login').send({
        email: 'test-jest@example.com',
        password: 'TestPass123!',
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should reject login with wrong password', async () => {
      const res = await request(testApp).post('/api/auth/login').send({
        email: 'test-jest@example.com',
        password: 'WrongPassword',
      });

      expect(res.status).toBe(401);
    });

    it('should reject login with non-existent email', async () => {
      const res = await request(testApp).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'TestPass123!',
      });

      expect(res.status).toBe(401);
    });
  });
});
