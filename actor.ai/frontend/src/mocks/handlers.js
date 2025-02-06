import { rest } from 'msw';

export const handlers = [
  rest.get('/api/actors/search', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 1,
          name: 'John Doe',
          birthplace: 'New York',
          birthday: '1980-01-01',
          movies: [{ id: 1, title: 'Test Movie', role: 'Lead' }]
        }
      ])
    );
  }),

  rest.get('/api/actors/:id', (req, res, ctx) => {
    return res(
      ctx.json({
        id: req.params.id,
        name: 'John Doe',
        birthplace: 'New York',
        birthday: '1980-01-01',
        bio: 'Test bio',
        photos: [{ id: 1, url: 'test.jpg' }],
        movies: [{ id: 1, title: 'Test Movie', role: 'Lead' }]
      })
    );
  }),

  rest.post('/api/auth/login', (req, res, ctx) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'password') {
      return res(
        ctx.json({
          token: 'test-token',
          isAdmin: true
        })
      );
    }
    return res(ctx.status(401));
  })
]; 