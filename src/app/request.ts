export interface RequestOptions {
  method?: string
  headers?: HeadersInit
  body?: any
}

export interface StatusResponse {
  status: number
  message?: string
}

export default async function Request<T>(
  url: string,
  options?: RequestOptions
): Promise<T | StatusResponse> {
  try {
    options = {
      method: options?.body ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers
      },
      body:
        options?.body &&
        (typeof options.body !== 'string'
          ? JSON.stringify(options.body)
          : options.body)
    }
    log(
      `tx ${options.method}: ${url}`,
      options.body && JSON.parse(options.body)
    )
    const res = await fetch(url, options)
    const type = res.headers.get('Content-Type') || 'application/json'
    let data = await (type.includes('application/json')
      ? res.json()
      : type.includes('application/octet-stream')
      ? res.blob()
      : res.text())
    if ((!data || !data.status) && !res.ok)
      data = { status: res.status, message: res.statusText }
    log(`rx ${options.method}: ${url}`, res, data)
    return data
  } catch (err) {
    log(`ex ${url}`, err)
    return { status: -200, message: (err as Error).message }
  }
}

function log(message: string, ...args: any[]) {
  // eslint-disable-next-line no-console
  return process.env.NODE_ENV === 'development' && console.log(message, ...args)
}

if (process.env.NODE_ENV === 'development') {
  const w = window as never as { req: typeof Request }
  w.req = Request
}
