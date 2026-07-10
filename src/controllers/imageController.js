import { processImage, deleteFile, moveFile } from '../middleware/upload.js';

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { width, quality, folder } = req.body;

    const options = {
      width: width ? parseInt(width) : 1200,
      quality: quality ? parseInt(quality) : 80,
      folder: folder || 'images'
    };

    const imagePath = await processImage(req.file, options);

    res.status(201).json({
      message: 'Image uploaded successfully',
      imagePath,
      url: `http://${req.get('host')}${imagePath}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadVideos = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video uploaded' });
    }

    // Move the file from temp folder to 'videos' folder
    const videoPath = moveFile(req.file, 'videos');

    res.status(201).json({
      message: 'Video uploaded successfully',
      videoPath,
      url: `http://${req.get('host')}${videoPath}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { width, quality, folder } = req.body;

    const options = {
      width: width ? parseInt(width) : 1200,
      quality: quality ? parseInt(quality) : 80,
      folder: folder || 'images'
    };

    const imagePaths = await Promise.all(
      req.files.map(file => processImage(file, options))
    );

    const urls = imagePaths.map(path => ({
      path,
      url: `http://${req.get('host')}${path}`
    }));

    res.status(201).json({
      message: 'Images uploaded successfully',
      count: urls.length,
      images: urls
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { folder } = req.body;
    const documentPath = moveFile(req.file, folder || 'documents');

    res.status(201).json({
      message: 'Document uploaded successfully',
      documentPath,
      url: `http://${req.get('host')}${documentPath}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    deleteFile(filePath);

    res.json({
      message: 'File deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
