export interface ApiError {
  error: {
    code: string
    message: string
  }
}

export interface ApiResponse<T> {
  data: T
}
