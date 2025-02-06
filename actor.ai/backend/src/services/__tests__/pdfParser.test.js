const PDFParser = require('../pdfParser');

jest.mock('pdf-parse', () => jest.fn());

describe('PDFParser Service', () => {
  const mockPDFContent = `
Name: John Doe
Birthplace: New York
Birthday: 1990-01-01
Biography: Test biography

Filmography:
Movie One - Lead Actor
Movie Two - Supporting Role
  `.trim();

  beforeEach(() => {
    require('pdf-parse').mockResolvedValue({
      text: mockPDFContent
    });
  });

  test('extracts actor information from PDF', async () => {
    const result = await PDFParser.extractActorInfo(Buffer.from('test'));

    expect(result).toEqual({
      name: 'John Doe',
      birthplace: 'New York',
      birthday: '1990-01-01',
      bio: 'Test biography',
      movies: [
        { title: 'Movie One', role: 'Lead Actor' },
        { title: 'Movie Two', role: 'Supporting Role' }
      ]
    });
  });

  test('handles missing fields', async () => {
    require('pdf-parse').mockResolvedValue({
      text: 'Name: John Doe'
    });

    const result = await PDFParser.extractActorInfo(Buffer.from('test'));

    expect(result.name).toBe('John Doe');
    expect(result.birthplace).toBe('');
    expect(result.movies).toEqual([]);
  });

  test('handles PDF parsing errors', async () => {
    require('pdf-parse').mockRejectedValue(new Error('PDF parsing failed'));

    await expect(PDFParser.extractActorInfo(Buffer.from('test')))
      .rejects
      .toThrow('PDF parsing failed');
  });
}); 