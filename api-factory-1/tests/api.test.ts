import request from 'supertest';
import app from '../src/index'; // Adjust the path as necessary

describe('API Endpoints', () => {
    it('should get all items', async () => {
        const response = await request(app).get('/api/items'); // Adjust the endpoint as necessary
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get an item by ID', async () => {
        const response = await request(app).get('/api/items/1'); // Adjust the endpoint and ID as necessary
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', 1);
    });

    it('should create a new item', async () => {
        const newItem = { name: 'New Item' }; // Adjust the payload as necessary
        const response = await request(app).post('/api/items').send(newItem); // Adjust the endpoint as necessary
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('name', newItem.name);
    });

    it('should update an item', async () => {
        const updatedItem = { name: 'Updated Item' }; // Adjust the payload as necessary
        const response = await request(app).put('/api/items/1').send(updatedItem); // Adjust the endpoint and ID as necessary
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('name', updatedItem.name);
    });

    it('should delete an item', async () => {
        const response = await request(app).delete('/api/items/1'); // Adjust the endpoint and ID as necessary
        expect(response.status).toBe(204);
    });
});