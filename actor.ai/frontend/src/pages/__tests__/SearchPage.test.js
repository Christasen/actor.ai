import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchPage from '../SearchPage';

describe('SearchPage', () => {
  test('renders search form', () => {
    render(<SearchPage />);
    
    expect(screen.getByLabelText(/actor name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/birthplace/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/birth year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/movie/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  test('performs search and displays results', async () => {
    render(<SearchPage />);
    
    const nameInput = screen.getByLabelText(/actor name/i);
    userEvent.type(nameInput, 'John');
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    });
  });

  test('handles search error', async () => {
    server.use(
      rest.get('/api/actors/search', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<SearchPage />);
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/search failed/i)).toBeInTheDocument();
    });
  });
}); 