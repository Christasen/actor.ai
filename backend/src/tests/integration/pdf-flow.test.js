const request = require('supertest');
const path = require('path');
const app = require('../../app');
const { createTestUser } = require('../helpers');
const { client: esClient } = require('../../config/elasticsearch');

describe('PDF Upload Flow', () => {
  let adminToken;
  const testPdfPath = path.join(__dirname, '../fixtures/test-actor.pdf');

  beforeEach(async () => {
    const { token } = await createTestUser(true);
    adminToken = token;
  });

  test('processes PDF and creates actor', async () => {
    // 1. Upload PDF
    const uploadResponse = await request(app)
      .post('/api/admin/upload-pdf')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('pdf', testPdfPath);

    expect(uploadResponse.status).toBe(201);
    const actorId = uploadResponse.body.actor.id;

    // Wait for Elasticsearch indexing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. Verify actor was created with correct data
    const actorResponse = await request(app)
      .get(`/api/actors/${actorId}`);

    expect(actorResponse.status).toBe(200);
    expect(actorResponse.body.name).toBe('John Doe'); // Assuming this is in the test PDF
    expect(actorResponse.body.movies).toBeDefined();

    // 3. Verify actor is searchable
    const searchResponse = await request(app)
      .get('/api/actors/search')
      .query({ name: 'John Doe' });

    expect(searchResponse.status).toBe(200);
    expect(searchResponse.body).toHaveLength(1);
    expect(searchResponse.body[0].id).toBe(actorId);
  });
}); 