import type { Request, Response } from 'express'
import type { AuthRequest } from '../../shared/middleware/auth'
import { certificateService } from './certificate.service'
import { issueCertificateSchema } from './certificate.schema'
import { generateCertificatePdfBuffer } from './certificate.pdf'
import { config } from '../../config/env'

class CertificateController {
  async issueCertificate(req: AuthRequest, res: Response) {
    const dto = issueCertificateSchema.parse(req.body)

    const certificate = await certificateService.issueCertificate(req.user!.userId, dto.courseId)

    res.status(201).json({ data: certificate })
  }

  async getMyCertificates(req: AuthRequest, res: Response) {
    const certificates = await certificateService.getUserCertificates(req.user!.userId)

    res.json({ data: certificates })
  }

  async getMyCertificateByCourse(req: AuthRequest, res: Response) {
    const { courseId } = req.params

    const certificate = await certificateService.getUserCertificateForCourse(
      req.user!.userId,
      courseId
    )

    res.json({ data: certificate })
  }

  async verifyCertificate(req: Request, res: Response) {
    const { code } = req.params

    const certificate = await certificateService.verifyCertificate(code)

    res.json({ data: certificate })
  }

  async getCertificatePdf(req: AuthRequest, res: Response) {
    const { id } = req.params

    const certificate = await certificateService.getCertificateForUserById(
      req.user!.userId,
      id
    )

    const verifyUrl = `${config.frontendUrl}/certificates/${certificate.certificateCode}`

    const pdfBuffer = await generateCertificatePdfBuffer({
      certificate,
      verifyUrl,
    })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      `inline; filename="certificate-${certificate.certificateCode}.pdf"`
    )

    res.send(pdfBuffer)
  }
}

export const certificateController = new CertificateController()

