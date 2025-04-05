// arquivo: /home/aleks/projetos/vintepila/controle-gastos/backend/src/routes/user-routes.ts
import { FastifyInstance } from 'fastify'
import { verifyJwt } from '../middlewares/verify-jwt'
import { prisma } from '@/lib/prisma'
import { UserController } from '@/http/controllers/user-controller'
import bcrypt from 'bcrypt'
export function userRoutes(app: FastifyInstance) {
  const userController = new UserController()

  // Rota de registro
  app.post('/users', userController.create)

  // Rota de login
  app.post('/sessions', async (request, reply) => {
    const { email, password } = request.body as {
      email: string
      password: string
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        return reply.status(400).send({ message: 'Invalid credentials.' })
      }

      const passwordMatch = await bcrypt.compare(password, user.password)

      if (!passwordMatch) {
        return reply.status(400).send({ message: 'Invalid credentials.' })
      }

      const token = app.jwt.sign({ sub: user.id }, { expiresIn: '1d' })

      return reply.status(200).send({ token })
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ message: 'Internal server error' })
    }
  })

  // Rotas protegidas
  app.register((protectedRoutes) => {
    protectedRoutes.addHook('onRequest', verifyJwt)

    protectedRoutes.get('/profile', userController.profile)
  })
}
