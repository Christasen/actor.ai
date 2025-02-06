const path = require('path');
const fs = require('fs').promises;
const AWS = require('aws-sdk');
const FileStorage = require('../fileStorage');

jest.mock('aws-sdk');
jest.mock('sharp', () => ({
  __esModule: true,
  default: jest.fn().mockReturnThis(),
  resize: jest.fn().mockReturnThis(),
  jpeg: jest.fn().mockReturnThis(),
  toBuffer: jest.fn().mockResolvedValue(Buffer.from('test'))
}));

describe('FileStorage Service', () => {
  let fileStorage;
  const mockFile = {
    buffer: Buffer.from('test'),
    originalname: 'test.jpg',
    mimetype: 'image/jpeg'
  };

  beforeEach(() => {
    process.env.STORAGE_TYPE = 'local';
    fileStorage = new FileStorage();
  });

  describe('Local Storage', () => {
    test('saves file locally', async () => {
      const url = await fileStorage.saveLocally(mockFile.buffer, mockFile);
      
      expect(url).toMatch(/^\/uploads\/.+\.jpg$/);
      
      // Verify file exists
      const filePath = path.join(__dirname, '../../..', url);
      const exists = await fs.access(filePath)
        .then(() => true)
        .catch(() => false);
      
      expect(exists).toBe(true);

      // Cleanup
      await fs.unlink(filePath);
    });

    test('deletes file locally', async () => {
      // First save a file
      const url = await fileStorage.saveLocally(mockFile.buffer, mockFile);
      const filePath = path.join(__dirname, '../../..', url);

      // Then delete it
      await fileStorage.deleteFile(url);

      // Verify file doesn't exist
      const exists = await fs.access(filePath)
        .then(() => true)
        .catch(() => false);
      
      expect(exists).toBe(false);
    });
  });

  describe('S3 Storage', () => {
    beforeEach(() => {
      process.env.STORAGE_TYPE = 's3';
      AWS.S3.mockClear();
    });

    test('uploads file to S3', async () => {
      const mockS3Upload = jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({
          Location: 'https://s3-bucket.com/test.jpg'
        })
      });

      AWS.S3.mockImplementation(() => ({
        upload: mockS3Upload
      }));

      fileStorage = new FileStorage();
      const url = await fileStorage.uploadToS3(mockFile.buffer, mockFile);

      expect(url).toBe('https://s3-bucket.com/test.jpg');
      expect(mockS3Upload).toHaveBeenCalled();
    });

    test('deletes file from S3', async () => {
      const mockS3Delete = jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({})
      });

      AWS.S3.mockImplementation(() => ({
        deleteObject: mockS3Delete
      }));

      fileStorage = new FileStorage();
      await fileStorage.deleteFile('https://s3-bucket.com/actors/test.jpg');

      expect(mockS3Delete).toHaveBeenCalledWith({
        Bucket: process.env.S3_BUCKET,
        Key: 'actors/test.jpg'
      });
    });
  });

  describe('File Validation', () => {
    test('accepts valid image types', () => {
      const mockCallback = jest.fn();
      
      fileStorage.imageFileFilter({}, {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg'
      }, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, true);
    });

    test('rejects invalid file types', () => {
      const mockCallback = jest.fn();
      
      fileStorage.imageFileFilter({}, {
        originalname: 'test.txt',
        mimetype: 'text/plain'
      }, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(
        expect.any(Error)
      );
    });
  });
}); 