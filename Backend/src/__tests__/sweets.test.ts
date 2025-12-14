import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../app';

let mongoServer: MongoMemoryServer;
let authToken: string;
let adminToken: string;


beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);


    await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Test User',
            email: 'user@test.com',
            password: 'password123'
        });

    const userResponse = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'user@test.com',
            password: 'password123'
        });

    authToken = userResponse.body.data.token;

    // Register and login an admin user
    await request(app)
        .post('/api/auth/register/admin')
        .send({
            name: 'Admin User',
            email: 'admin@test.com',
            password: 'adminpass123',
            adminSecret: process.env.ADMIN_SECRET || 'admin_secret_key'
        });

    const adminResponse = await request(app)
        .post('/api/auth/login/admin')
        .send({
            email: 'admin@test.com',
            password: 'adminpass123'
        });

    adminToken = adminResponse.body.data.token;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    // Clear only sweets collection after each test
    const Sweet = mongoose.connection.collections['sweets'];
    if (Sweet) {
        await Sweet.deleteMany({});
    }
});

describe('Sweets API - Create Sweet', () => {
    describe('POST /api/sweets', () => {
        it('should create a new sweet with authenticated user', async () => {
            const response = await request(app)
                .post('/api/sweets/')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Chocolate Bar',
                    category: 'Chocolate',
                    price: 2.99,
                    quantity: 100
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('sweet');
            expect(response.body.data.sweet).toHaveProperty('name', 'Chocolate Bar');
            expect(response.body.data.sweet).toHaveProperty('category', 'Chocolate');
            expect(response.body.data.sweet).toHaveProperty('price', 2.99);
            expect(response.body.data.sweet).toHaveProperty('quantity', 100);
        });

        it('should not create sweet without authentication', async () => {
            const response = await request(app)
                .post('/api/sweets/')
                .send({
                    name: 'Chocolate Bar',
                    category: 'Chocolate',
                    price: 2.99,
                    quantity: 100
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should not create sweet with missing required fields', async () => {
            const response = await request(app)
                .post('/api/sweets/')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Chocolate Bar'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });
});

describe('Sweets API - Get All Sweets', () => {
    describe('GET /api/sweets', () => {
        beforeEach(async () => {
            // Create some test sweets
            await request(app)
                .post('/api/sweets/')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Chocolate Bar',
                    category: 'Chocolate',
                    price: 2.99,
                    quantity: 100
                });

            await request(app)
                .post('/api/sweets/')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Gummy Bears',
                    category: 'Gummy',
                    price: 1.99,
                    quantity: 50
                });
        });

        it('should get all sweets with authentication (protected)', async () => {
            const response = await request(app)
                .get('/api/sweets/')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('sweets');
            expect(Array.isArray(response.body.data.sweets)).toBe(true);
            expect(response.body.data.sweets.length).toBe(2);
        });

        it('should not get sweets without authentication', async () => {
            const response = await request(app)
                .get('/api/sweets/');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
});

describe('Sweets API - Search Sweets', () => {
    describe('GET /api/sweets/search', () => {
        beforeEach(async () => {
            // Create test sweets
            await request(app)
                .post('/api/sweets/')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Chocolate Bar',
                    category: 'Chocolate',
                    price: 2.99,
                    quantity: 100
                });

            await request(app)
                .post('/api/sweets/')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Dark Chocolate',
                    category: 'Chocolate',
                    price: 3.99,
                    quantity: 50
                });

            await request(app)
                .post('/api/sweets/')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Gummy Bears',
                    category: 'Gummy',
                    price: 1.99,
                    quantity: 75
                });
        });

        it('should search sweets by name with authentication', async () => {
            const response = await request(app)
                .get('/api/sweets/search?name=Chocolate')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.sweets.length).toBe(2);
        });

        it('should search sweets by category with authentication', async () => {
            const response = await request(app)
                .get('/api/sweets/search?category=Gummy')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.sweets.length).toBe(1);
            expect(response.body.data.sweets[0].name).toBe('Gummy Bears');
        });

        it('should search sweets by price range with authentication', async () => {
            const response = await request(app)
                .get('/api/sweets/search?minPrice=2&maxPrice=3')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.sweets.length).toBe(1);
            expect(response.body.data.sweets[0].name).toBe('Chocolate Bar');
        });
    });
});

describe('Sweets API - Update Sweet', () => {
    describe('PUT /api/sweets/:id', () => {
        let sweetId: string;

        beforeEach(async () => {
            const createResponse = await request(app)
                .post('/api/sweets/')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Chocolate Bar',
                    category: 'Chocolate',
                    price: 2.99,
                    quantity: 100
                });

            sweetId = createResponse.body.data.sweet._id;
        });

        it('should update sweet with authenticated user', async () => {
            const response = await request(app)
                .put(`/api/sweets/${sweetId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    price: 3.49,
                    quantity: 150
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.sweet.price).toBe(3.49);
            expect(response.body.data.sweet.quantity).toBe(150);
        });

        it('should not update sweet without authentication', async () => {
            const response = await request(app)
                .put(`/api/sweets/${sweetId}`)
                .send({
                    price: 3.49
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
});

describe('Sweets API - Delete Sweet', () => {
    describe('DELETE /api/sweets/:id', () => {
        let sweetId: string;

        beforeEach(async () => {
            const createResponse = await request(app)
                .post('/api/sweets/')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Chocolate Bar',
                    category: 'Chocolate',
                    price: 2.99,
                    quantity: 100
                });

            sweetId = createResponse.body.data.sweet._id;
        });

        it('should delete sweet with admin privileges', async () => {
            const response = await request(app)
                .delete(`/api/sweets/${sweetId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('deleted');
        });

        it('should not delete sweet with regular user', async () => {
            const response = await request(app)
                .delete(`/api/sweets/${sweetId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('admin');
        });

        it('should not delete sweet without authentication', async () => {
            const response = await request(app)
                .delete(`/api/sweets/${sweetId}`);

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
});

describe('Sweets API - Purchase Sweet (Inventory)', () => {
    describe('POST /api/sweets/:id/purchase', () => {
        let sweetId: string;

        beforeEach(async () => {
            const createResponse = await request(app)
                .post('/api/sweets/')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Chocolate Bar',
                    category: 'Chocolate',
                    price: 2.99,
                    quantity: 10
                });

            sweetId = createResponse.body.data.sweet._id;
        });

        it('should purchase sweet and decrease quantity with authentication', async () => {
            const response = await request(app)
                .post(`/api/sweets/${sweetId}/purchase`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.sweet.quantity).toBe(9);
            expect(response.body.message).toContain('purchased');
        });

        it('should not purchase without authentication', async () => {
            const response = await request(app)
                .post(`/api/sweets/${sweetId}/purchase`);

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should not purchase when out of stock', async () => {
            // Create a sweet with 0 quantity
            const outOfStockResponse = await request(app)
                .post('/api/sweets/')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Rare Candy',
                    category: 'Special',
                    price: 9.99,
                    quantity: 0
                });

            const outOfStockId = outOfStockResponse.body.data.sweet._id;

            const response = await request(app)
                .post(`/api/sweets/${outOfStockId}/purchase`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('out of stock');
        });

        it('should handle multiple purchases correctly', async () => {
            // Purchase 1
            await request(app)
                .post(`/api/sweets/${sweetId}/purchase`)
                .set('Authorization', `Bearer ${authToken}`);

            // Purchase 2
            await request(app)
                .post(`/api/sweets/${sweetId}/purchase`)
                .set('Authorization', `Bearer ${authToken}`);

            // Purchase 3
            const response = await request(app)
                .post(`/api/sweets/${sweetId}/purchase`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.sweet.quantity).toBe(7);
        });
    });
});

describe('Sweets API - Restock Sweet (Inventory)', () => {
    describe('POST /api/sweets/:id/restock', () => {
        let sweetId: string;

        beforeEach(async () => {
            const createResponse = await request(app)
                .post('/api/sweets/')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Chocolate Bar',
                    category: 'Chocolate',
                    price: 2.99,
                    quantity: 10
                });

            sweetId = createResponse.body.data.sweet._id;
        });

        it('should restock sweet with admin privileges', async () => {
            const response = await request(app)
                .post(`/api/sweets/${sweetId}/restock`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    amount: 50
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.sweet.quantity).toBe(60);
            expect(response.body.message).toContain('restocked');
        });

        it('should not restock without admin privileges', async () => {
            const response = await request(app)
                .post(`/api/sweets/${sweetId}/restock`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    amount: 50
                });

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('admin');
        });

        it('should not restock without authentication', async () => {
            const response = await request(app)
                .post(`/api/sweets/${sweetId}/restock`)
                .send({
                    amount: 50
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should not restock with invalid amount', async () => {
            const response = await request(app)
                .post(`/api/sweets/${sweetId}/restock`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    amount: -10
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('valid amount');
        });
    });
});

