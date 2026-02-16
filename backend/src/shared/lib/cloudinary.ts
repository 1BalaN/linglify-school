import { v2 as cloudinary } from 'cloudinary'
import { config } from '../../config/env'

// Инициализация Cloudinary
const isConfigured = !!(
  config.cloudinary.cloudName &&
  config.cloudinary.apiKey &&
  config.cloudinary.apiSecret
)

if (isConfigured) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  })
  console.log('☁️  Cloudinary: configured')
} else if (config.isDevelopment) {
  console.log('⚠️  Cloudinary: not configured (using base64 fallback)')
}

/**
 * Загружает изображение в Cloudinary
 * @param base64 - изображение в формате base64 (data:image/...)
 * @param userId - ID пользователя для именования файла
 * @returns URL загруженного изображения
 */
export async function uploadAvatar(base64: string, userId: string): Promise<string> {
  if (!isConfigured) {
    // Если Cloudinary не настроен, возвращаем base64
    return base64
  }

  try {
    const result = await cloudinary.uploader.upload(base64, {
      folder: 'linglify/avatars',
      public_id: userId,
      overwrite: true,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    })

    return result.secure_url
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error instanceof Error ? error.message : 'Unknown error')
    // В случае ошибки возвращаем base64
    return base64
  }
}

/**
 * Удаляет аватар из Cloudinary
 * @param userId - ID пользователя
 */
export async function deleteAvatar(userId: string): Promise<void> {
  if (!isConfigured) {
    return
  }

  try {
    await cloudinary.uploader.destroy(`linglify/avatars/${userId}`)
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error instanceof Error ? error.message : 'Unknown error')
  }
}

/**
 * Проверяет, является ли строка base64 изображением
 */
export function isBase64Image(str: string): boolean {
  return str.startsWith('data:image/')
}

/**
 * Проверяет, является ли строка URL изображения
 */
export function isImageUrl(str: string): boolean {
  try {
    const url = new URL(str)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
