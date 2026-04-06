import i18n from '@/shared/i18n/config'

const API_URL = import.meta.env.VITE_API_URL as string

export interface DocumentUploadResult {
  url: string
  name: string
  size: number
}

export async function uploadDocument(file: File): Promise<DocumentUploadResult> {
  const token = localStorage.getItem('accessToken')
  const formData = new FormData()
  formData.append('document', file)

  const res = await fetch(`${API_URL}/upload/document`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const msg =
      typeof data?.message === 'string' && data.message
        ? data.message
        : i18n.t('uploadHttpError', { ns: 'validation', status: res.status })
    throw new Error(msg)
  }

  const data = await res.json()
  return {
    url: data.data.url,
    name: data.data.name ?? file.name,
    size: data.data.size ?? file.size,
  }
}
