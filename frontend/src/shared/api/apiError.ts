export type ApiErrorBody = {
  status?: number
  error?: string
  message?: string
  path?: string
  timestamp?: string
}

export class ApiError extends Error {
  readonly status: number
  readonly body: ApiErrorBody | null

  constructor(message: string, status: number, body: ApiErrorBody | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }

  static async fromResponse(response: Response) {
    const body = await readErrorBody(response)
    const message = body?.message ?? body?.error ?? `Request failed with status ${response.status}`

    return new ApiError(message, response.status, body)
  }
}

async function readErrorBody(response: Response): Promise<ApiErrorBody | null> {
  const contentType = response.headers.get('content-type')

  if (!contentType?.includes('application/json')) {
    return null
  }

  try {
    return (await response.json()) as ApiErrorBody
  } catch {
    return null
  }
}
