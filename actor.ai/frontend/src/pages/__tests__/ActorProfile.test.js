import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { rest } from 'msw';
import { server } from '../../mocks/server';
import ActorProfile from '../ActorProfile';
import { AuthProvider } from '../../contexts/AuthContext';

const renderWithRouter = (ui, { route = '/actor/1' } = {}) => {
  window.history.pushState({}, 'Test page', route);

  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <Routes>
          <Route path="/actor/:id" element={ui} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('ActorProfile', () => {
  test('renders loading state initially', () => {
    renderWithRouter(<ActorProfile />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('renders actor details', async () => {
    renderWithRouter(<ActorProfile />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText(/new york/i)).toBeInTheDocument();
      expect(screen.getByText(/test bio/i)).toBeInTheDocument();
      expect(screen.getByText(/test movie/i)).toBeInTheDocument();
    });
  });

  test('handles error state', async () => {
    server.use(
      rest.get('/api/actors/:id', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    renderWithRouter(<ActorProfile />);

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch actor details/i)).toBeInTheDocument();
    });
  });

  test('navigates through photos', async () => {
    server.use(
      rest.get('/api/actors/:id', (req, res, ctx) => {
        return res(ctx.json({
          id: 1,
          name: 'John Doe',
          photos: [
            { id: 1, url: 'photo1.jpg' },
            { id: 2, url: 'photo2.jpg' }
          ]
        }));
      })
    );

    renderWithRouter(<ActorProfile />);

    await waitFor(() => {
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    expect(screen.getByText('2 / 2')).toBeInTheDocument();

    const prevButton = screen.getByRole('button', { name: /previous/i });
    fireEvent.click(prevButton);

    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  test('shows photo upload for admin users', async () => {
    localStorage.setItem('isAdmin', 'true');
    
    renderWithRouter(<ActorProfile />);

    await waitFor(() => {
      expect(screen.getByText(/add photo/i)).toBeInTheDocument();
    });

    localStorage.removeItem('isAdmin');
  });

  test('hides photo upload for non-admin users', async () => {
    localStorage.setItem('isAdmin', 'false');
    
    renderWithRouter(<ActorProfile />);

    await waitFor(() => {
      expect(screen.queryByText(/add photo/i)).not.toBeInTheDocument();
    });

    localStorage.removeItem('isAdmin');
  });
}); 