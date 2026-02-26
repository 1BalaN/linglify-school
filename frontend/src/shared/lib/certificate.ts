import { apiBaseUrl } from '@/app/store/api'

export const openCertificatePdf = async (certificateId: string) => {
  const token = localStorage.getItem('accessToken')
  const url = `${apiBaseUrl}/certificates/${certificateId}/pdf`

  try {
    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })

    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch certificate PDF', response.status)
      return
    }

    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    window.open(blobUrl, '_blank')
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error opening certificate PDF', error)
  }
}

