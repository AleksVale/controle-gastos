import { FastifyInstance } from 'fastify'
import { ExpenseController } from '../http/controllers/expense-controller'
import { verifyJwt } from '../middlewares/verify-jwt'

export function expenseRoutes(app: FastifyInstance) {
  const expenseController = new ExpenseController()

  app.addHook('onRequest', verifyJwt)

  app.post('/expenses', expenseController.create)
  app.get('/expenses', expenseController.list)
  app.get('/expenses/:id', expenseController.get)
  app.put('/expenses/:id', expenseController.update)
  app.delete('/expenses/:id', expenseController.delete)
}
