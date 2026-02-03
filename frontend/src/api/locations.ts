import { api } from './client'

export interface LocationItem {
  code: string
  name: string
  fullName?: string
}

export interface LocationsResponse {
  locations: LocationItem[]
}

export const locationsApi = {
  getList: () => api.get<LocationsResponse>('/api/locations'),
}
