export type PostStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED'

export type Post = {
  id: string
  authorId: string
  authorUsername: string
  title: string
  content: string
  status: PostStatus
  rejectionReason: string | null
  imageUrl: string | null
  hashtags: string[]
  createdAt: string
}
