export interface PnpmLockFile{
  lockfileVersion:string
  specifiers: Record<string, string>
  dependencies:Record<string, string>
  packages: Record<string, any>
}
