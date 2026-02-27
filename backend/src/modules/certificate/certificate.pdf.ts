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

  /* ================== DATA ================== */

  const fullName =
    [certificate.user.firstName, certificate.user.lastName]
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

  const courseTitle = certificate.course.title
  const level = certificate.course.level
  const category = certificate.course.category
  const finalScoreText =
    typeof certificate.finalScore === 'number'
      ? `${Math.round(certificate.finalScore)}%`
      : '—'

  const teacherName = certificate.course.teacher
    ? [certificate.course.teacher.firstName, certificate.course.teacher.lastName]
        .filter(Boolean)
        .join(' ')
    : 'ФИО'

  /* ================== FONT ================== */

  const fontCandidates = [
    // Для production (dist / рабочая директория)
    path.resolve(process.cwd(), 'assets/fonts/LinglifySans-Regular.ttf'),
    // Для разработки (src-путь)
    path.resolve(__dirname, '../../assets/fonts/LinglifySans-Regular.ttf'),
  ]

  const fontPath = fontCandidates.find(p => fs.existsSync(p))
  const baseFont = fontPath || 'Helvetica'

  /* ================== QR ================== */

  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1 })
  const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64')

  /* ================== PDF ================== */

  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
  })

  const buffers: Buffer[] = []
  doc.on('data', b => buffers.push(b as Buffer))

  const result = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)))
    doc.on('error', reject)
  })

  doc.font(baseFont)

  const { width, height } = doc.page

  /* ================== FRAME ================== */

  doc.rect(30, 30, width - 60, height - 60)
    .strokeColor('#CBD5F5')
    .lineWidth(2)
    .stroke()

  doc.rect(40, 40, width - 80, height - 80)
    .strokeColor('#6366F1')
    .lineWidth(1.5)
    .stroke()

  /* ================== WATERMARK ================== */

  doc.save()
  doc.rotate(-20, { origin: [width / 2, height / 2] })
  doc.fontSize(64).fillColor('#EEF2FF')
    .text('Linglify', 0, height / 2 - 32, { align: 'center' })
  doc.restore()

  /* ================== HEADER ================== */

  doc.fontSize(22).fillColor('#4338CA').text('Linglify', 80, 70)
  doc.fontSize(15).fillColor('#4B5563')
    .text('Платформа онлайн-обучения иностранным языкам', 80, 95)

  /* ================== TITLE ================== */

  doc.fontSize(28).fillColor('#111827')
    .text('СЕРТИФИКАТ ОБ ОКОНЧАНИИ КУРСА', 0, 140, { align: 'center' })

  /* ================== MAIN ================== */

  const mainTop = 190

  doc.fontSize(13).fillColor('#4B5563')
    .text('Настоящий сертификат подтверждает, что', 0, mainTop, { align: 'center' })

  doc.fontSize(25).fillColor('#111827')
    .text(fullName, 0, mainTop + 24, {
      align: 'center',
      characterSpacing: 0.8,
    })

  doc.moveTo(width / 2 - 160, mainTop + 56)
    .lineTo(width / 2 + 160, mainTop + 56)
    .strokeColor('#E5E7EB')
    .lineWidth(1)
    .stroke()

  doc.fontSize(14).fillColor('#4B5563')
    .text('успешно завершил(а) курс', 0, mainTop + 72, { align: 'center' })

  doc.fontSize(18).fillColor('#111827')
    .text(courseTitle, 0, mainTop + 92, { align: 'center' })

  doc.fontSize(12).fillColor('#374151')
    .text(
      [
        category && `Категория: ${category}`,
        level && `Уровень языка: ${level}`,
      ].filter(Boolean).join(' • '),
      0,
      mainTop + 122,
      { align: 'center' }
    )

  /* ================== RESULT BADGE ================== */

  const badgeY = mainTop + 150
  doc.roundedRect(width / 2 - 130, badgeY, 260, 32, 6).fill('#EEF2FF')
  doc.fontSize(12).fillColor('#3730A3')
    .text(`Финальный результат: ${finalScoreText}`, 0, badgeY + 9, {
      width,
      align: 'center',
    })

  /* ================== FOOTER ================== */

  const footerTop = height - 150

  doc.fontSize(11).fillColor('#4B5563')
    .text(`Дата выдачи: ${issuedDate}`, 80, footerTop)

  doc.text(`Код верификации: ${certificate.certificateCode}`, 80, footerTop + 18)

  /* ================== SIGNATURE ================== */

  const signX = width / 2 + 40
  const signY = footerTop + 8

  const signaturePath = path.resolve(
    __dirname,
    '../../assets/signatures/director.png'
  )

  if (fs.existsSync(signaturePath)) {
    doc.image(signaturePath, signX, signY, { width: 120 })
  }

  doc.moveTo(signX, signY + 30)
    .lineTo(signX + 200, signY + 30)
    .strokeColor('#9CA3AF')
    .lineWidth(1)
    .stroke()

  doc.fontSize(10).fillColor('#111827')
    .text(teacherName, signX, signY + 34)

  doc.fontSize(8).fillColor('#6B7280')
    .text('Преподаватель / Администратор', signX, signY + 48)

  /* ================== QR ================== */

  doc.image(qrBuffer, width - 220, height - 220, { width: 120 })
  doc.fontSize(9).fillColor('#6B7280')
    .text('Проверка подлинности', width - 220, height - 90, {
      width: 120,
      align: 'center',
    })

  doc.end()
  return result
}