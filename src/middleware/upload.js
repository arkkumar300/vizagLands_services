import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

['images', 'documents', 'videos', 'temp'].forEach(dir => {
  const dirPath = path.join(uploadDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(uploadDir, 'temp'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',

    // Videos
    'video/mp4',
    'video/mpeg',
    'video/ogg',
    'video/webm',

    // Audio
    'audio/mpeg',   // .mp3
    'audio/mp3',    // sometimes browsers use this
    'audio/wav',    // .wav
    'audio/x-wav',
    'audio/ogg',    // .ogg
    'audio/webm',   // .webm
    'audio/aac',    // .aac
    'audio/mp4',    // .m4a

    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image, video, audio, and document files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Video upload (500MB)
const uploadVideo = multer({
  storage,
  fileFilter: fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }
});

const processImage = async (file, options = {}) => {
  const { width = 1200, quality = 80, folder = 'images' } = options;

  const processedFileName = `${uuidv4()}.webp`;
  const outputPath = path.join(uploadDir, folder, processedFileName);

  await sharp(file.path)
    .resize(width, null, { withoutEnlargement: true })
    .webp({ quality })
    .toFile(outputPath);

  fs.unlinkSync(file.path);

  return `/uploads/${folder}/${processedFileName}`;
};

const deleteFile = (filePath) => {
  if (!filePath) return;

  const fullPath = path.join(__dirname, '../..', filePath);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

const moveFile = (file, folder = 'documents') => {
  const fileName = path.basename(file.path);
  const newPath = path.join(uploadDir, folder, fileName);

  fs.renameSync(file.path, newPath);

  return `/uploads/${folder}/${fileName}`;
};

export { upload,uploadVideo, processImage, deleteFile, moveFile };
