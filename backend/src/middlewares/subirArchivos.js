/**
 * Middleware para Subir Archivos
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createError } = require('./manejoErrores');

/**
 * Crear directorio de uploads si no existe
 */
const createUploadsDir = () => {
  const uploadDir = 'uploads/salones';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

/**
 * Configuración de almacenamiento local
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = createUploadsDir();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = file.fieldname + '-' + uniqueSuffix + ext;
    cb(null, name);
  }
});

/**
 * Filtro para validar tipos de archivos
 */
const fileFilter = (req, file, cb) => {
  // Permitir solo imágenes
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(createError('Solo se permiten archivos de imagen (JPG, PNG, WebP)', 400), false);
  }
};

/**
 * Configuración de multer
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 10 // máximo 10 archivos
  }
});

/**
 * Middleware para múltiples fotos de salón
 */
const uploadSalonPhotos = upload.array('fotos', 10);

/**
 * Middleware para una sola foto
 */
const uploadSinglePhoto = upload.single('foto');

/**
 * Wrapper para manejo de errores de multer
 */
const handleUploadErrors = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(createError('Archivo muy grande. Máximo 5MB', 400));
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return next(createError('Demasiados archivos. Máximo 10', 400));
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return next(createError('Campo de archivo inesperado', 400));
          }
        }
        return next(err);
      }
      next();
    });
  };
};

/**
 * Procesar archivos subidos y generar URLs
 */
const processUploadedFiles = (req, res, next) => {
  if (req.files && req.files.length > 0) {
    // Generar URLs para múltiples archivos
    req.uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: `/uploads/salones/${file.filename}`,
      mimetype: file.mimetype
    }));
  } else if (req.file) {
    // Un solo archivo
    req.uploadedFile = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      url: `/uploads/salones/${req.file.filename}`,
      mimetype: req.file.mimetype
    };
  }
  
  next();
};

/**
 * Eliminar archivo del sistema
 */
const deleteFile = (filename) => {
  try {
    const filePath = path.join('uploads/salones', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

module.exports = {
  uploadSalonPhotos: handleUploadErrors(uploadSalonPhotos),
  uploadSinglePhoto: handleUploadErrors(uploadSinglePhoto),
  processUploadedFiles,
  deleteFile
};