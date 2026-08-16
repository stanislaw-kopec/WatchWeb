export type CommentTreeNode = {
  id: string
  parentId: string | null
  authorId: string
  authorUsername: string
  content: string | null
  depth: number
  deleted: boolean
  createdAt: string
  children: CommentTreeNode[]
}

export type WatchComment = CommentTreeNode

export type PostComment = CommentTreeNode
