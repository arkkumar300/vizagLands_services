import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------------------
// Sharp Configuration
// ----------------------
sharp.concurrency(1);
sharp.cache(false);
sharp.simd(false);

// ----------------------
// Upload Directories
// ----------------------
const uploadDir = path.join(__dirname, "../../uploads");

["images", "documents", "videos", "temp"].forEach((folder) => {
  const folderPath = path.join(uploadDir, folder);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
});

// ----------------------
// Multer Storage
// ----------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(uploadDir, "temp"));
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  },
});

// ----------------------
// File Filter
// ----------------------
const allowedMimes = [
  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",

  // Videos
  "video/mp4",
  "video/mpeg",
  "video/ogg",
  "video/webm",

  // Audio
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/webm",
  "audio/aac",
  "audio/mp4",

  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const fileFilter = (req, file, cb) => {
  if (allowedMimes.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(
    new Error(
      "Invalid file type. Only images, videos, audio and documents are allowed."
    )
  );
};

// ----------------------
// Upload Middlewares
// ----------------------
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

const uploadVideo = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
});

// ----------------------
// Process Image
// ----------------------
const processImage = async (file, options = {}) => {
  const {
    width = 1200,
    quality = 80,
    folder = "images",
  } = options;

  const folderPath = path.join(uploadDir, folder);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const fileName = `${uuidv4()}.webp`;
  const outputPath = path.join(folderPath, fileName);

  try {
    await sharp(file.path)
      .rotate()
      .resize({
        width,
        withoutEnlargement: true,
        fit: "inside",
      })
      .webp({
        quality,
        effort: 3,
      })
      .toFile(outputPath);

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return `/uploads/${folder}/${fileName}`;
  } catch (err) {
    console.error("Sharp Error:", err);

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    throw err;
  }
};

// ----------------------
// Move File
// ----------------------
const moveFile = (file, folder = "documents") => {
  const folderPath = path.join(uploadDir, folder);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const fileName = path.basename(file.path);
  const destination = path.join(folderPath, fileName);

  fs.renameSync(file.path, destination);

  return `/uploads/${folder}/${fileName}`;
};

// ----------------------
// Delete File
// ----------------------
const deleteFile = (filePath) => {
  if (!filePath) return;

  const fullPath = path.join(__dirname, "../..", filePath);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

export {
  upload,
  uploadVideo,
  processImage,
  moveFile,
  deleteFile,
};