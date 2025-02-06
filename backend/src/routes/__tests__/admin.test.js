const request = require('supertest');
const path = require('path');
const app = require('../../app');
const { createTestUser, createTestActor } = require('../../tests/helpers');
const fileStorage = require('../../services/fileStorage');

jest.mock('../../services/fileStorage');

describe('Admin Routes', () => {
  let adminToken;

  beforeEach(async () => {
    const { token } = await createTestUser(true);
    adminToken = token;
  });

  describe('POST /api/admin/actors', () => {
    test('creates new actor', async () => {
      const actorData = {
        name: 'New Actor',
        birthplace: 'New City',
        birthday: '1995-01-01',
        bio: 'New bio'
      };

      const response = await request(app)
        .post('/api/admin/actors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(actorData);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('New Actor');
    });

    test('requires authentication', async () => {
      const response = await request(app)
        .post('/api/admin/actors')
        .send({});

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/admin/actors/:id/photos', () => {
    test('uploads photo', async () => {
      const actor = await createTestActor();
      const testPhotoUrl = 'http://test-url/photo.jpg';
      
      fileStorage.optimizeAndUpload.mockResolvedValue(testPhotoUrl);

      const response = await request(app)
        .post(`/api/admin/actors/${actor.id}/photos`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('photo', path.join(__dirname, '../../tests/fixtures/test-photo.jpg'));

      expect(response.status).toBe(201);
      expect(response.body.url).toBe(testPhotoUrl);
    });

    test('validates file type', async () => {
      const actor = await createTestActor();

      const response = await request(app)
        .post(`/api/admin/actors/${actor.id}/photos`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('photo', path.join(__dirname, '../../tests/fixtures/test.txt'));

      expect(response.status).toBe(400);
    });
  });
}); 