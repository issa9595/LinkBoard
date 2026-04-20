export type Category = {
  id: string
  name: string
  color: string // hex de la palette Atlassian
  createdAt: number
  order: number
}

export type Link = {
  id: string
  url: string
  title: string
  description?: string
  categoryId: string
  createdAt: number
  order: number
}
