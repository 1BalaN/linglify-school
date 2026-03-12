import type { Response } from 'express'
import https from 'https'
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

  /**
   * POST /api/upload/audio
   * Загрузить аудио-файл (для прослушивания / listening) в Cloudinary
   */
  async uploadAudio(req: AuthRequest, res: Response) {
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

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'linglify/audio',
          resource_type: 'video',
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

    res.json({
      data: {
        url: result.secure_url,
        name: file.originalname || 'Audio',
      },
    })
  }

  /**
   * GET /api/upload/document/download
   * Прокси для скачивания документа с Cloudinary с человекочитаемым именем файла.
   */
  downloadDocument(req: AuthRequest, res: Response) {
    const { url, name } = req.query

    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: { code: 'INVALID_URL', message: 'Некорректная ссылка на файл.' } })
      return
    }

    try {
      const parsed = new URL(url)

      // Разрешаем только Cloudinary raw-документы из нашей папки
      if (
        !parsed.hostname.includes('res.cloudinary.com') ||
        !parsed.pathname.includes('/raw/upload/') ||
        !parsed.pathname.includes('/linglify/documents/')
      ) {
        res.status(400).json({ error: { code: 'INVALID_DOCUMENT_URL', message: 'Недопустимый источник файла.' } })
        return
      }

      const safeName =
        (typeof name === 'string' && name.trim().replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 80)) || 'document'

      https
        .get(parsed.toString(), cloudRes => {
          const status = cloudRes.statusCode ?? 500

          if (status >= 400) {
            res
              .status(502)
              .json({ error: { code: 'DOCUMENT_DOWNLOAD_FAILED', message: 'Не удалось скачать документ.' } })
            cloudRes.resume()
            return
          }

          const contentType = cloudRes.headers['content-type'] ?? 'application/octet-stream'
          res.setHeader('Content-Type', contentType)
          res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(safeName)}"`)

          cloudRes.pipe(res)
        })
        .on('error', () => {
          if (!res.headersSent) {
            res
              .status(502)
              .json({ error: { code: 'DOCUMENT_DOWNLOAD_FAILED', message: 'Ошибка при скачивании документа.' } })
          }
        })
    } catch {
      res.status(400).json({ error: { code: 'INVALID_URL', message: 'Некорректная ссылка на файл.' } })
    }
  }
}

export const uploadController = new UploadController()
