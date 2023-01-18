import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InfoState from '../components/infoState'
import LoadingState from '../components/loadingState'
import { ProgressInfo } from 'electron-updater'

type States =
  | 'loading'
  | 'checking'
  | 'available'
  | 'downloading'
  | 'downloaded'

export default function Update() {
  const navigate = useNavigate()
  const [state, setState] = useState<States>('loading')
  const [progress, setProgress] = useState<ProgressInfo | undefined>()

  const showApp = () => navigate('app')

  useEffect(
    () =>
      window.updateAPI.onError(error => {
        throw error
      }),
    []
  )

  useEffect(() => window.updateAPI.onChecking(() => setState('checking')), [])

  useEffect(
    () =>
      window.updateAPI.onChecked(available =>
        available ? setState('available') : showApp()
      ),
    []
  )

  useEffect(
    () =>
      window.updateAPI.onProgress((progress: ProgressInfo) => {
        setState('downloading')
        setProgress(progress)
      }),
    []
  )

  useEffect(
    () => window.updateAPI.onDownloaded(() => setState('downloaded')),
    []
  )

  useEffect(
    () => window.updateAPI.onIgnored(() => setTimeout(showApp, 1000)),
    []
  )

  useEffect(() => window.appAPI.ready(), [])

  switch (state) {
    case 'loading':
      return <LoadingState />
    case 'checking':
      return (
        <InfoState
          title="Just a moment!"
          description="We're checking for updates..."
        />
      )
    case 'available':
      return (
        <InfoState
          title="Update Available!"
          description="Looks like we found an update..."
        />
      )
    case 'downloading':
      return (
        <InfoState
          title="Downloading Update..."
          description={`${progress?.total}% (${progress?.bytesPerSecond}B/s)`}
        />
      )
    case 'downloaded':
      return (
        <InfoState
          title="Update Downloaded!"
          description="Please restart the app to finalize update..."
        />
      )
    default:
      throw new Error(`Unknown update state: ${state}`)
  }
}
