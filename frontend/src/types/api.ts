export interface User {
  id: number
  name: string
  email: string
  createdAt: string
}

export interface Expense {
  id: number
  amount: number
  description?: string
  date: string
  userId: number
  categoryId?: number
  createdAt: string
  updatedAt: string
  category?: Category
  tags?: TagsOnExpenses[]
}

export interface Category {
  id: number
  name: string
  color?: string
  icon?: string
  userId: number
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface Tag {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export interface TagsOnExpenses {
  expenseId: number
  tagId: number
  createdAt: string
  tag: Tag
}

export interface Budget {
  id: number
  amount: number
  startDate: string
  endDate: string
  userId: number
  categoryId?: number
  createdAt: string
  updatedAt: string
  category?: Category
}

export interface RecurringItem {
  id: number
  amount: number
  description: string
  frequency: string
  startDate: string
  endDate?: string
  userId: number
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    perPage: number
    pageCount: number
  }
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}
