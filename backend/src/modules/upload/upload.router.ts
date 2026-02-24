import { Router } from 'express'
import multer from 'multer'
import { requireAuth, requireRole } from '../../shared/middleware/auth'
import { uploadController } from './upload.controller'

const router = Router()

// Multer config — store in memory for Cloudinary streaming
const storage = multer.memoryStorage()

const videoUpload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Допустимые форматы: MP4, WebM, OGG, MOV, AVI'))
    }
  },
})

const imageUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Допустимые форматы: JPEG, PNG, WebP, GIF'))
    }
  },
})

// Загрузка видео (только для учителей и админов)
router.post(
  '/video',
  requireAuth,
  requireRole('TEACHER', 'ADMIN'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  videoUpload.single('video') as any,
  uploadController.uploadVideo
)

// Загрузка изображения (только для учителей и админов)
router.post(
  '/image',
  requireAuth,
  requireRole('TEACHER', 'ADMIN'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  imageUpload.single('image') as any,
  uploadController.uploadImage
)

export default router
