import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { server } from '../../mocks/server';
import PhotoUpload from '../PhotoUpload';

describe('PhotoUpload', () => {
  const mockProps = {
    actorId: 1,
    photos: [
      { id: 1, url: 'test1.jpg' },
      { id: 2, url: 'test2.jpg' }
    ],
    onPhotoAdded: jest.fn(),
    onPhotoDeleted: jest.fn()
  };

  beforeEach(() => {
    mockProps.onPhotoAdded.mockClear();
    mockProps.onPhotoDeleted.mockClear();
  });

  test('renders upload button and existing photos', () => {
    render(<PhotoUpload {...mockProps} />);

    expect(screen.getByText(/add photo/i)).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  test('handles file upload successfully', async () => {
    server.use(
      rest.post('/api/admin/actors/1/photos', (req, res, ctx) => {
        return res(ctx.json({ id: 3, url: 'test3.jpg' }));
      })
    );

    render(<PhotoUpload {...mockProps} />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/add photo/i);

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(mockProps.onPhotoAdded).toHaveBeenCalledWith({
        id: 3,
        url: 'test3.jpg'
      });
    });
  });

  test('handles upload error', async () => {
    server.use(
      rest.post('/api/admin/actors/1/photos', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<PhotoUpload {...mockProps} />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/add photo/i);

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText(/failed to upload photo/i)).toBeInTheDocument();
    });
  });

  test('handles photo deletion', async () => {
    server.use(
      rest.delete('/api/admin/actors/1/photos/1', (req, res, ctx) => {
        return res(ctx.json({ message: 'Photo deleted' }));
      })
    );

    render(<PhotoUpload {...mockProps} />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockProps.onPhotoDeleted).toHaveBeenCalledWith(1);
    });
  });

  test('handles deletion error', async () => {
    server.use(
      rest.delete('/api/admin/actors/1/photos/1', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<PhotoUpload {...mockProps} />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/failed to delete photo/i)).toBeInTheDocument();
    });
  });
}); 