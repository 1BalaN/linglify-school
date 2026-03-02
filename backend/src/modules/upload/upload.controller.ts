import type { Response } from 'express'
import type { AuthRequest } from '../../shared/types/express'
import { v2 as cloudinary } from 'cloudinary'
import { config } from '../../config/env'
import { AppError } from '../../shared/middleware/errorHandler'

const isCloudinaryConfigured = !!(
  config.cloudinary.cloudName &&
  config.cloudinary.apiKey &&
  config.cloudinary.apiSecret
)

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  })
}

class UploadController {
  /**
   * POST /api/upload/video
   * Загрузить видео файл в Cloudinary
   */
  async uploadVideo(req: AuthRequest, res: Response) {
    if (!req.file) {
      throw new AppError(400, 'NO_FILE', 'Файл не найден')
    }

    if (!isCloudinaryConfigured) {
      throw new AppError(503, 'CLOUDINARY_NOT_CONFIGURED', 'Хранилище файлов не настроено. Обратитесь к администратору.')
    }

    const file = req.file

    // Upload to Cloudinary via buffer
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'linglify/videos',
          resource_type: 'video',
          // Limit to 500MB, convert to mp4
          transformation: [{ quality: 'auto' }],
        },
        (error, result) => {
          if (error) reject(error)
          else if (result) resolve(result)
          else reject(new Error('Unknown upload error'))
        }
      )
      uploadStream.end(file.buffer)
    })

    res.json({ data: { url: result.secure_url } })
  }

  /**
   * POST /api/upload/image
   * Загрузить изображение (обложка курса)
   */
  async uploadImage(req: AuthRequest, res: Response) {
    if (!req.file) {
      throw new AppError(400, 'NO_FILE', 'Файл не найден')
    }

    if (!isCloudinaryConfigured) {
      throw new AppError(503, 'CLOUDINARY_NOT_CONFIGURED', 'Хранилище файлов не настроено.')
    }

    const file = req.file

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'linglify/images',
          resource_type: 'image',
          transformation: [
            { width: 1280, height: 720, crop: 'fill' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error)
          else if (result) resolve(result)
          else reject(new Error('Unknown upload error'))
        }
      )
      uploadStream.end(file.buffer)
    })

    res.json({ data: { url: result.secure_url } })
  }

  /**
   * POST /api/upload/document
   * Загрузить документ (методичка: PDF, DOC, DOCX, TXT, ODT) в Cloudinary
   */
  async uploadDocument(req: AuthRequest, res: Response) {
    if (!req.file) {
      throw new AppError(400, 'NO_FILE', 'Файл не найден')
    }

    if (!isCloudinaryConfigured) {
      throw new AppError(
        503,
        'CLOUDINARY_NOT_CONFIGURED',
        'Хранилище файлов не настроено. Обратитесь к администратору.'
      )
    }

    const file = req.file

    const result = await new Promise<{ secure_url: string; bytes?: number }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'linglify/documents',
          resource_type: 'raw',
        },
        (error, result) => {
          if (error) reject(error)
          else if (result) resolve(result)
          else reject(new Error('Unknown upload error'))
        }
      )
      uploadStream.end(file.buffer)
    })

    res.json({
      data: {
        url: result.secure_url,
        name: file.originalname || 'Документ',
        size: file.size,
      },
    })
  }
}

export const uploadController = new UploadController()
