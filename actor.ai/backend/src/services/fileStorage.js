const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;

class FileStorage {
  constructor() {
    this.storageType = process.env.STORAGE_TYPE || 'local';
    
    if (this.storageType === 's3') {
      this.s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
      });
    }
  }

  getUploader() {
    if (this.storageType === 's3') {
      return this.getS3Uploader();
    }
    return this.getLocalUploader();
  }

  getS3Uploader() {
    return multer({
      storage: multerS3({
        s3: this.s3,
        bucket: process.env.S3_BUCKET,
        metadata: (req, file, cb) => {
          cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
          const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
          cb(null, `actors/${fileName}`);
        }
      }),
      fileFilter: this.imageFileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
      }
    });
  }

  getLocalUploader() {
    const uploadDir = path.join(__dirname, '../../uploads');
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    return multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
          cb(null, fileName);
        }
      }),
      fileFilter: this.imageFileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
      }
    });
  }

  imageFileFilter(req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }

  async optimizeAndUpload(file) {
    const optimizedBuffer = await sharp(file.buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    if (this.storageType === 's3') {
      return this.uploadToS3(optimizedBuffer, file);
    }
    return this.saveLocally(optimizedBuffer, file);
  }

  async uploadToS3(buffer, file) {
    const fileName = `${uuidv4()}.jpg`;
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: `actors/${fileName}`,
      Body: buffer,
      ContentType: 'image/jpeg'
    };

    const result = await this.s3.upload(params).promise();
    return result.Location;
  }

  async saveLocally(buffer, file) {
    const fileName = `${uuidv4()}.jpg`;
    const filePath = path.join(__dirname, '../../uploads', fileName);
    await fs.writeFile(filePath, buffer);
    return `/uploads/${fileName}`;
  }

  async deleteFile(fileUrl) {
    if (this.storageType === 's3') {
      const key = fileUrl.split('/').slice(-2).join('/');
      await this.s3.deleteObject({
        Bucket: process.env.S3_BUCKET,
        Key: key
      }).promise();
    } else {
      const filePath = path.join(__dirname, '../..', fileUrl);
      await fs.unlink(filePath);
    }
  }
}

module.exports = new FileStorage(); 