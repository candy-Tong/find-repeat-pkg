export interface PnpmLockFile{
  lockfileVersion:string
  specifiers: Record<string, string>
  dependencies:Record<string, string>
  packages: Record<string, any>
}

export interface PackageJSON {
  peerDependency?: Record<string, any>
  devDependencies?: Record<string, any>
  dependency?: Record<string, any>
}
