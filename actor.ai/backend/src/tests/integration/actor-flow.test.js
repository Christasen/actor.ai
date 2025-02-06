const request = require('supertest');
const app = require('../../app');
const { createTestUser } = require('../helpers');
const { client: esClient } = require('../../config/elasticsearch');

describe('Actor Creation and Search Flow', () => {
  let adminToken;

  beforeEach(async () => {
    const { token } = await createTestUser(true);
    adminToken = token;
  });

  test('creates actor and finds via search', async () => {
    // 1. Create actor
    const actorData = {
      name: 'Integration Test Actor',
      birthplace: 'Test City',
      birthday: '1990-01-01',
      bio: 'Test biography',
      movies: [
        { title: 'Test Movie', role: 'Lead' }
      ]
    };

    const createResponse = await request(app)
      .post('/api/admin/actors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(actorData);

    expect(createResponse.status).toBe(201);
    const actorId = createResponse.body.id;

    // Wait for Elasticsearch indexing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. Search for actor
    const searchResponse = await request(app)
      .get('/api/actors/search')
      .query({ name: 'Integration Test Actor' });

    expect(searchResponse.status).toBe(200);
    expect(searchResponse.body).toHaveLength(1);
    expect(searchResponse.body[0].name).toBe(actorData.name);

    // 3. Get actor details
    const detailsResponse = await request(app)
      .get(`/api/actors/${actorId}`);

    expect(detailsResponse.status).toBe(200);
    expect(detailsResponse.body.name).toBe(actorData.name);
    expect(detailsResponse.body.movies).toHaveLength(1);
  });
}); 