import fastify from 'fastify'
import jwt from '@fastify/jwt'
import cors from '@fastify/cors'
import { userRoutes } from './routes/user-routes'
import { expenseRoutes } from './routes/expense-routes'
import { categoryRoutes } from './routes/category-routes'
import { env } from './env'

export const app = fastify({ logger: true })

app.register(cors, {
  origin: true,
})

app.register(jwt, {
  secret: env.JWT_SECRET,
  sign: {
    expiresIn: env.JWT_EXPIRES_IN,
  },
})

app.register(userRoutes, { prefix: '/api' })
app.register(expenseRoutes, { prefix: '/api' })
app.register(categoryRoutes, { prefix: '/api' })

app.get('/health', () => {
  return { status: 'ok' }
})
