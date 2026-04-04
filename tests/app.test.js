const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongod;
let adminToken;
let viewerToken;
let createdRecordId;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.DATABASE_URL = mongod.getUri();
  app = require('../src/app');
  await mongoose.connect(process.env.DATABASE_URL);

  await request(app).post('/api/v1/auth/register').send({
    email: 'admin@test.com',
    password: 'AdminPass123!',
    setupKey: 'test-bootstrap'
  });

  const loginRes = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@test.com',
    password: 'AdminPass123!'
  });
  adminToken = loginRes.body.data.accessToken;

  const createViewer = await request(app)
    .post('/api/v1/users')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ email: 'viewer@test.com', password: 'ViewerPass123!', role: 'viewer', isActive: true });

  expect(createViewer.statusCode).toBe(201);

  const viewerLogin = await request(app).post('/api/v1/auth/login').send({
    email: 'viewer@test.com',
    password: 'ViewerPass123!'
  });
  viewerToken = viewerLogin.body.data.accessToken;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

test('creates user as admin', async () => {
  const res = await request(app)
    .post('/api/v1/users')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ email: 'analyst@test.com', password: 'AnalystPass123!', role: 'analyst', isActive: true });

  expect(res.statusCode).toBe(201);
  expect(res.body.success).toBe(true);
  expect(res.body.data.email).toBe('analyst@test.com');
});

test('login returns access token', async () => {
  const res = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@test.com',
    password: 'AdminPass123!'
  });

  expect(res.statusCode).toBe(200);
  expect(res.body.data.accessToken).toBeDefined();
});

test('viewer cannot create record', async () => {
  const res = await request(app)
    .post('/api/v1/records')
    .set('Authorization', `Bearer ${viewerToken}`)
    .send({ amount: 1200, type: 'income', category: 'salary', date: '2026-04-01', notes: 'April salary' });

  expect(res.statusCode).toBe(403);
});

test('admin can create record', async () => {
  const res = await request(app)
    .post('/api/v1/records')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ amount: 1200, type: 'income', category: 'salary', date: '2026-04-01', notes: 'April salary' });

  expect(res.statusCode).toBe(201);
  expect(res.body.data.category).toBe('salary');
  createdRecordId = res.body.data.id;
});

test('dashboard summary returns totals', async () => {
  await request(app)
    .post('/api/v1/records')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ amount: 300, type: 'expense', category: 'food', date: '2026-04-02', notes: 'groceries' });

  const res = await request(app)
    .get('/api/v1/dashboard/summary')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.data.totalIncome).toBe(1200);
  expect(res.body.data.totalExpenses).toBe(300);
  expect(res.body.data.netBalance).toBe(900);
  expect(Array.isArray(res.body.data.recentActivity)).toBe(true);
});
