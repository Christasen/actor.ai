const request = require('supertest');
const app = require('../../app'); // You'll need to export the app from index.js
const { createTestActor } = require('../../tests/helpers');
const { client } = require('../../config/elasticsearch');

describe('Actor Routes', () => {
  beforeEach(async () => {
    await client.indices.delete({ index: 'actors' });
    await client.indices.create({
      index: 'actors',
      body: {
        mappings: {
          properties: {
            name: { type: 'text' },
            birthplace: { type: 'text' },
            birthday: { type: 'date' },
            bio: { type: 'text' }
          }
        }
      }
    });
  });

  describe('GET /api/actors/search', () => {
    test('searches actors by name', async () => {
      const actor = await createTestActor();
      await client.index({
        index: 'actors',
        id: actor.id.toString(),
        body: actor,
        refresh: true
      });

      const response = await request(app)
        .get('/api/actors/search')
        .query({ name: 'Test Actor' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Test Actor');
    });

    test('returns empty array when no matches', async () => {
      const response = await request(app)
        .get('/api/actors/search')
        .query({ name: 'Nonexistent Actor' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('GET /api/actors/:id', () => {
    test('returns actor by id', async () => {
      const actor = await createTestActor();

      const response = await request(app)
        .get(`/api/actors/${actor.id}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Test Actor');
    });

    test('returns 404 for non-existent actor', async () => {
      const response = await request(app)
        .get('/api/actors/999');

      expect(response.status).toBe(404);
    });
  });
}); 