import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'
import path from 'path'
import fs from 'fs'
import type { Certificate, Course } from '@prisma/client'

interface CertificatePdfContext {
  certificate: Certificate & {
    course: Course & {
      teacher?: {
        firstName: string | null
        lastName: string | null
      }
    }
    user: {
      firstName: string | null
      lastName: string | null
    }
  }
  verifyUrl: string
}

export async function generateCertificatePdfBuffer(
  context: CertificatePdfContext
): Promise<Buffer> {
  const { certificate, verifyUrl } = context

  const fullName = [certificate.user.firstName, certificate.user.lastName]
    .filter(Boolean)
    .join(' ')
    .trim() || 'Студент Linglify'

  const issuedDate = certificate.issuedAt
    ? new Date(certificate.issuedAt).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : ''

  const level = certificate.course.level
  const category = certificate.course.category ?? ''
  const courseTitle = certificate.course.title

  const finalScoreText =
    typeof certificate.finalScore === 'number'
      ? `${Math.round(certificate.finalScore)}%`
      : '—'

  const teacherName = certificate.course.teacher
    ? [certificate.course.teacher.firstName, certificate.course.teacher.lastName]
        .filter(Boolean)
        .join(' ')
        .trim()
    : ''

  // Font configuration: try to use custom Cyrillic-capable font if available
  const fontPath = path.resolve(
    __dirname,
    '../../assets/fonts/LinglifySans-Regular.ttf'
  )
  const hasCustomFont = fs.existsSync(fontPath)
  const baseFont = hasCustomFont ? fontPath : 'Helvetica'

  if (!hasCustomFont) {
    // eslint-disable-next-line no-console
    console.warn(
      '[Linglify] Certificate PDF: custom font not found at',
      fontPath,
      '- falling back to Helvetica (no Cyrillic support). ' +
        'Add a TTF font file with Cyrillic support to fix garbled text.'
    )
  }

  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1 })
  const qrBase64 = qrDataUrl.split(',')[1] ?? ''
  const qrBuffer = Buffer.from(qrBase64, 'base64')

  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
  })

  const buffers: Buffer[] = []

  doc.on('data', chunk => {
    buffers.push(chunk as Buffer)
  })

  const resultPromise = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => {
      resolve(Buffer.concat(buffers))
    })
    doc.on('error', error => {
      reject(error)
    })
  })

  // Set base font (with Cyrillic support when available)
  doc.font(baseFont)

  // Background and frame
  const { width, height } = doc.page

  doc.rect(30, 30, width - 60, height - 60).strokeColor('#CBD5F5').lineWidth(2).stroke()

  doc
    .rect(40, 40, width - 80, height - 80)
    .strokeColor('#6366F1')
    .lineWidth(1.5)
    .stroke()

  // Watermark
  doc.save()
  doc.rotate(-20, { origin: [width / 2, height / 2] })
  doc
    .fontSize(72)
    .fillColor('#E5E7EB')
    .text('Linglify', 0, height / 2 - 36, {
      align: 'center',
    })
  doc.restore()

  // Header
  doc.fontSize(22).fillColor('#6366F1').text('Linglify', 80, 70)

  doc
    .fontSize(16)
    .fillColor('#4B5563')
    .text('Платформа онлайн-обучения иностранным языкам', 80, 95)

  // Title
  doc
    .fontSize(28)
    .fillColor('#111827')
    .text('СЕРТИФИКАТ ОБ ОКОНЧАНИИ КУРСА', 0, 140, {
      align: 'center',
    })

  // Main text
  const mainTextTop = 190

  doc
    .fontSize(13)
    .fillColor('#4B5563')
    .text('Настоящий сертификат подтверждает, что', 0, mainTextTop, {
      align: 'center',
    })

  doc
    .fontSize(24)
    .fillColor('#111827')
    .text(fullName, 0, mainTextTop + 25, {
      align: 'center',
    })

  const courseLine = `успешно завершил(а) курс "${courseTitle}"`
  const levelCategoryParts = [
    level ? `уровень: ${level}` : '',
    category ? `категория: ${category}` : '',
  ].filter(Boolean)
  const levelCategory = levelCategoryParts.length > 0 ? ` (${levelCategoryParts.join(', ')})` : ''

  doc
    .fontSize(13)
    .fillColor('#4B5563')
    .text(`${courseLine}${levelCategory}`, 0, mainTextTop + 65, {
      align: 'center',
    })

  doc
    .fontSize(13)
    .fillColor('#374151')
    .text(
      `и успешно прошёл(а) финальный тест курса с результатом ${finalScoreText}.`,
      0,
      mainTextTop + 90,
      {
        align: 'center',
      }
    )

  // Footer with date, code and signature area
  const footerTop = height - 150

  // Left block: meta
  doc
    .fontSize(11)
    .fillColor('#4B5563')
    .text(`Дата выдачи: ${issuedDate}`, 80, footerTop)

  doc
    .fontSize(11)
    .fillColor('#4B5563')
    .text(`Код верификации: ${certificate.certificateCode}`, 80, footerTop + 18)

  doc
    .fontSize(10)
    .fillColor('#6B7280')
    .text(
      'Подлинность сертификата можно проверить на платформе Linglify по указанному коду или QR‑коду.',
      80,
      footerTop + 40,
      {
        width: width / 2,
      }
    )

  // Right block: signature lines
  const signX = width / 2 + 40
  const signY = footerTop + 10

  doc
    .fontSize(10)
    .fillColor('#4B5563')
    .text('Преподаватель / Администратор', signX, signY)

  doc
    .moveTo(signX, signY + 30)
    .lineTo(signX + 200, signY + 30)
    .strokeColor('#9CA3AF')
    .lineWidth(1)
    .stroke()

  doc
    .fontSize(8)
    .fillColor('#9CA3AF')
    .text(
      teacherName
        ? `Подпись, ${teacherName}`
        : 'Подпись, ФИО',
      signX,
      signY + 34
    )

  // QR code
  const qrSize = 120
  const qrX = width - qrSize - 100
  const qrY = height - qrSize - 110

  doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize })

  doc
    .fontSize(9)
    .fillColor('#6B7280')
    .text('Наведите камеру, чтобы проверить сертификат', qrX, qrY + qrSize + 4, {
      width: qrSize,
      align: 'center',
    })

  doc.end()

  return resultPromise
}

