import { spawn } from 'child_process'
import fetch from 'electron-fetch'

export async function Request(url: string) {
  const res = await fetch(url)
  let data = await res.json()
  if ((!data || !data.status) && !res.ok)
    data = { status: res.status, message: res.statusText }
  return data
}

export default function Download(url: string, filename: string) {
  return new Promise<string>((resolve, reject) => {
    const process = spawn('curl', ['-o', filename, url])
    let data = '',
      errData = ''

    process.stdout.on('data', (chunk: Buffer) => (data += chunk.toString()))
    process.stderr.on('data', (chunk: Buffer) => (errData += chunk.toString()))

    process.on('close', code =>
      code && code > 0 ? reject(new Error(errData)) : resolve(data)
    )

    process.on('error', err => reject(err))
  })
}
