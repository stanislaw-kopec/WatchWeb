export type WatchComment = {
  id: string
  parentId: string | null
  authorId: string
  authorUsername: string
  content: string | null
  depth: number
  deleted: boolean
  createdAt: string
  children: WatchComment[]
}
