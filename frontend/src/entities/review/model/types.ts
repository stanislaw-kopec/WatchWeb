export type Review = {
  id: string
  watchId: string
  reviewerId: string
  reviewerUsername: string
  rating: number
  content: string
  createdAt: string
}

export type UserReview = {
  id: string
  watchId: string
  watchBrand: string
  watchModel: string
  rating: number
  content: string
  createdAt: string
}
