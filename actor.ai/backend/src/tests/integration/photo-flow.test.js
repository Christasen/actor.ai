const request = require('supertest');
const path = require('path');
const fs = require('fs').promises;
const app = require('../../app');
const { createTestUser, createTestActor } = require('../helpers');

describe('Photo Upload Flow', () => {
  let adminToken;
  let actor;
  const testPhotoPath = path.join(__dirname, '../fixtures/test-photo.jpg');

  beforeEach(async () => {
    const { token } = await createTestUser(true);
    adminToken = token;
    actor = await createTestActor();
  });

  test('uploads photo and manages it', async () => {
    // 1. Upload photo
    const uploadResponse = await request(app)
      .post(`/api/admin/actors/${actor.id}/photos`)
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('photo', testPhotoPath);

    expect(uploadResponse.status).toBe(201);
    const photoId = uploadResponse.body.id;
    const photoUrl = uploadResponse.body.url;

    // 2. Verify photo in actor details
    const actorResponse = await request(app)
      .get(`/api/actors/${actor.id}`);

    expect(actorResponse.status).toBe(200);
    expect(actorResponse.body.photos).toHaveLength(1);
    expect(actorResponse.body.photos[0].url).toBe(photoUrl);

    // 3. Delete photo
    const deleteResponse = await request(app)
      .delete(`/api/admin/actors/${actor.id}/photos/${photoId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteResponse.status).toBe(200);

    // 4. Verify photo is deleted
    const updatedActorResponse = await request(app)
      .get(`/api/actors/${actor.id}`);

    expect(updatedActorResponse.body.photos).toHaveLength(0);
  });
}); 