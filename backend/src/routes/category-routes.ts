import { FastifyInstance } from 'fastify'
import { CategoryController } from '../http/controllers/category-controller'
import { verifyJwt } from '../middlewares/verify-jwt'

export function categoryRoutes(app: FastifyInstance) {
  const categoryController = new CategoryController()

  app.addHook('onRequest', verifyJwt)

  app.post('/categories', categoryController.create)
  app.get('/categories', categoryController.list)
  app.get('/categories/:id', categoryController.get)
  app.put('/categories/:id', categoryController.update)
  app.delete('/categories/:id', categoryController.delete)
}
