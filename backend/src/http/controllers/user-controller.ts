import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../../lib/prisma'
import { z } from 'zod'
import { hash } from 'bcrypt'

export class UserController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const createUserSchema = z.object({
      name: z.string().min(3),
      email: z.string().email(),
      password: z.string().min(6),
    })

    try {
      const { name, email, password } = createUserSchema.parse(request.body)

      const userExists = await prisma.user.findUnique({
        where: { email },
      })

      if (userExists) {
        return reply.status(409).send({ message: 'Email already exists' })
      }

      const passwordHash = await hash(password, 10)

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: passwordHash,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      })

      return reply.status(201).send(user)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply
          .status(400)
          .send({ message: 'Validation error.', issues: error.format() })
      }

      return reply.status(500).send({ message: 'Internal server error' })
    }
  }

  async profile(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.sub

    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    return reply.status(200).send(user)
  }
}
