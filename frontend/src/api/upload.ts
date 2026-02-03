import { api } from './client'

export interface UploadResponse {
  url: string
}

export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post<UploadResponse>('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
