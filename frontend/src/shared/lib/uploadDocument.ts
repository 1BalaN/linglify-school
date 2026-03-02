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
    throw new Error(data?.message || `Ошибка загрузки ${res.status}`)
  }

  const data = await res.json()
  return {
    url: data.data.url,
    name: data.data.name ?? file.name,
    size: data.data.size ?? file.size,
  }
}
