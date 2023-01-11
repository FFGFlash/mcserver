declare interface IVersions {
  latest: {
    release: string
    snapshot: string
  }
  versions: {
    id: string
    type: 'release' | 'snapshot'
    url: string
    time: string
    releaseTime: string
    sha1: string
    complianceLevel: 0 | 1
  }[]
}
