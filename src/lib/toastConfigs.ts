export interface ToastConfig<T> {
  signing: string
  broadcasting: (hash: string) => string
  inBlock: string
  finalized: (details?: T) => string
  error: (error: string) => string
}
