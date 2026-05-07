export type Page<T> = {
  items: T[]
  nextCursor?: string
  previousCursor?: string
  next(): Promise<Page<T>>
  previous(): Promise<Page<T>>
}
