import { Router } from 'express'
import { certificateController } from './certificate.controller'
import { requireAuth } from '../../shared/middleware/auth'

const router = Router()

router.post('/', requireAuth, certificateController.issueCertificate)
router.get('/my', requireAuth, certificateController.getMyCertificates)
router.get('/my/:courseId', requireAuth, certificateController.getMyCertificateByCourse)
router.get('/verify/:code', certificateController.verifyCertificate)
router.get('/:id/pdf', requireAuth, certificateController.getCertificatePdf)

export default router

