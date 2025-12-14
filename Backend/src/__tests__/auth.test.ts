import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../app';

let mongoServer: MongoMemoryServer;

// Setup in-memory MongoDB for testing
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

describe('Auth API - Registration', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data.user).toHaveProperty('name', 'John Doe');
            expect(response.body.data.user).toHaveProperty('email', 'john@example.com');
            expect(response.body.data.user).not.toHaveProperty('password');
        });

        it('should not register user with duplicate email', async () => {
            // First registration
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'password123'
                });

            // Duplicate registration
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Jane Doe',
                    email: 'john@example.com',
                    password: 'password456'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('already exists');
        });

        it('should not register user with missing fields', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'john@example.com'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should not register user with invalid email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'John Doe',
                    email: 'invalid-email',
                    password: 'password123'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });
});

describe('Auth API - Admin Registration', () => {
    describe('POST /api/auth/register/admin', () => {
        it('should register a new admin user successfully', async () => {
            const response = await request(app)
                .post('/api/auth/register/admin')
                .send({
                    name: 'Admin User',
                    email: 'admin@example.com',
                    password: 'adminpass123',
                    adminSecret: process.env.ADMIN_SECRET || 'admin_secret_key'
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data.user).toHaveProperty('name', 'Admin User');
            expect(response.body.data.user).toHaveProperty('email', 'admin@example.com');
            expect(response.body.data.user).toHaveProperty('role', 'admin');
            expect(response.body.data.user).not.toHaveProperty('password');
        });

        it('should not register admin without admin secret', async () => {
            const response = await request(app)
                .post('/api/auth/register/admin')
                .send({
                    name: 'Admin User',
                    email: 'admin@example.com',
                    password: 'adminpass123'
                });

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('admin secret');
        });

        it('should not register admin with incorrect admin secret', async () => {
            const response = await request(app)
                .post('/api/auth/register/admin')
                .send({
                    name: 'Admin User',
                    email: 'admin@example.com',
                    password: 'adminpass123',
                    adminSecret: 'wrong_secret'
                });

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Invalid admin secret');
        });

        it('should not register admin with duplicate email', async () => {
            // First registration
            await request(app)
                .post('/api/auth/register/admin')
                .send({
                    name: 'Admin User',
                    email: 'admin@example.com',
                    password: 'adminpass123',
                    adminSecret: process.env.ADMIN_SECRET || 'admin_secret_key'
                });

            // Duplicate registration
            const response = await request(app)
                .post('/api/auth/register/admin')
                .send({
                    name: 'Another Admin',
                    email: 'admin@example.com',
                    password: 'adminpass456',
                    adminSecret: process.env.ADMIN_SECRET || 'admin_secret_key'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('already exists');
        });
    });
});

describe('Auth API - Admin Login', () => {
    describe('POST /api/auth/login/admin', () => {
        beforeEach(async () => {
            // Register an admin user before each test
            await request(app)
                .post('/api/auth/register/admin')
                .send({
                    name: 'Admin User',
                    email: 'admin@example.com',
                    password: 'adminpass123',
                    adminSecret: process.env.ADMIN_SECRET || 'admin_secret_key'
                });

            // Also register a regular user
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Regular User',
                    email: 'user@example.com',
                    password: 'password123'
                });
        });

        it('should login admin with correct credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login/admin')
                .send({
                    email: 'admin@example.com',
                    password: 'adminpass123'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data.user).toHaveProperty('email', 'admin@example.com');
            expect(response.body.data.user).toHaveProperty('role', 'admin');
            expect(typeof response.body.data.token).toBe('string');
        });

        it('should not allow regular user to login via admin endpoint', async () => {
            const response = await request(app)
                .post('/api/auth/login/admin')
                .send({
                    email: 'user@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('admin');
        });

        it('should not login with incorrect password', async () => {
            const response = await request(app)
                .post('/api/auth/login/admin')
                .send({
                    email: 'admin@example.com',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Invalid credentials');
        });

        it('should not login with non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/login/admin')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'adminpass123'
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Invalid credentials');
        });
    });
});

describe('Auth API - Login', () => {
    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Register a user before each login test
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'password123'
                });
        });

        it('should login user with correct credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'john@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data.user).toHaveProperty('email', 'john@example.com');
            expect(typeof response.body.data.token).toBe('string');
        });

        it('should not login with incorrect password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'john@example.com',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Invalid credentials');
        });

        it('should not login with non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Invalid credentials');
        });

        it('should not login with missing fields', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'john@example.com'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });
});

describe('Auth Middleware - Protected Routes', () => {
    let userToken: string;
    let adminToken: string;

    beforeEach(async () => {
        // Register and login a regular user
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Regular User',
                email: 'user@example.com',
                password: 'password123'
            });

        const userResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'user@example.com',
                password: 'password123'
            });

        userToken = userResponse.body.data.token;

        // Create an admin user directly in database
        const User = (await import('../models/User')).default;
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin'
        });

        const adminResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@example.com',
                password: 'password123'
            });

        adminToken = adminResponse.body.data.token;
    });

    describe('GET /api/auth/protected', () => {
        it('should deny access without token', async () => {
            const response = await request(app)
                .get('/api/auth/protected');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('token');
        });

        it('should deny access with invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/protected')
                .set('Authorization', 'Bearer invalid_token');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should allow access with valid token', async () => {
            const response = await request(app)
                .get('/api/auth/protected')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('GET /api/auth/admin', () => {
        it('should deny access to non-admin users', async () => {
            const response = await request(app)
                .get('/api/auth/admin')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('admin');
        });

        it('should allow access to admin users', async () => {
            const response = await request(app)
                .get('/api/auth/admin')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
});

