import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../../lib/prisma'
import { z } from 'zod'

export class CategoryController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const createCategorySchema = z.object({
      name: z.string().min(2),
      color: z.string().optional(),
      icon: z.string().optional(),
      isDefault: z.boolean().optional(),
    })

    try {
      const { name, color, icon, isDefault } = createCategorySchema.parse(
        request.body,
      )
      const userId = request.user.sub

      // Verificar se já existe uma categoria com o mesmo nome para este usuário
      const categoryExists = await prisma.category.findFirst({
        where: {
          name,
          userId: Number(userId),
        },
      })

      if (categoryExists) {
        return reply
          .status(409)
          .send({ message: 'Category with this name already exists' })
      }

      const category = await prisma.category.create({
        data: {
          name,
          color,
          icon,
          isDefault: isDefault ?? false,
          user: {
            connect: { id: Number(userId) },
          },
        },
      })

      return reply.status(201).send(category)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply
          .status(400)
          .send({ message: 'Validation error.', issues: error.format() })
      }

      return reply.status(500).send({ message: 'Internal server error' })
    }
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.sub

    try {
      const categories = await prisma.category.findMany({
        where: {
          userId: Number(userId),
        },
        orderBy: {
          name: 'asc',
        },
      })

      return reply.status(200).send(categories)
    } catch {
      return reply.status(500).send({ message: 'Internal server error' })
    }
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    const getCategorySchema = z.object({
      id: z.string(),
    })

    try {
      const { id } = getCategorySchema.parse(request.params)
      const userId = request.user.sub

      const category = await prisma.category.findFirst({
        where: {
          id: Number(id),
          userId: Number(userId),
        },
      })

      if (!category) {
        return reply.status(404).send({ message: 'Category not found' })
      }

      return reply.status(200).send(category)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply
          .status(400)
          .send({ message: 'Validation error.', issues: error.format() })
      }

      return reply.status(500).send({ message: 'Internal server error' })
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const updateCategoryParamsSchema = z.object({
      id: z.string(),
    })

    const updateCategoryBodySchema = z.object({
      name: z.string().min(2).optional(),
      color: z.string().optional(),
      icon: z.string().optional(),
      isDefault: z.boolean().optional(),
    })

    try {
      const { id } = updateCategoryParamsSchema.parse(request.params)
      const { name, color, icon, isDefault } = updateCategoryBodySchema.parse(
        request.body,
      )
      const userId = request.user.sub

      const category = await prisma.category.findFirst({
        where: {
          id: Number(id),
          userId: Number(userId),
        },
      })

      if (!category) {
        return reply.status(404).send({ message: 'Category not found' })
      }

      // Se o nome estiver sendo atualizado, verificar se já existe outra categoria com este nome
      if (name && name !== category.name) {
        const categoryExists = await prisma.category.findFirst({
          where: {
            name,
            userId: Number(userId),
            NOT: {
              id: Number(id),
            },
          },
        })

        if (categoryExists) {
          return reply
            .status(409)
            .send({ message: 'Another category with this name already exists' })
        }
      }

      const updatedCategory = await prisma.category.update({
        where: {
          id: Number(id),
        },
        data: {
          name,
          color,
          icon,
          isDefault,
        },
      })

      return reply.status(200).send(updatedCategory)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply
          .status(400)
          .send({ message: 'Validation error.', issues: error.format() })
      }

      return reply.status(500).send({ message: 'Internal server error' })
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const deleteCategorySchema = z.object({
      id: z.string(),
    })

    try {
      const { id } = deleteCategorySchema.parse(request.params)
      const userId = request.user.sub

      const category = await prisma.category.findFirst({
        where: {
          id: Number(id),
          userId: Number(userId),
        },
      })

      if (!category) {
        return reply.status(404).send({ message: 'Category not found' })
      }

      // Verificar se esta categoria está sendo usada
      const expensesCount = await prisma.expense.count({
        where: {
          categoryId: Number(id),
        },
      })

      if (expensesCount > 0) {
        return reply.status(400).send({
          message: 'Cannot delete category that is being used by expenses',
          expensesCount,
        })
      }

      await prisma.category.delete({
        where: {
          id: Number(id),
        },
      })

      return reply.status(204).send()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply
          .status(400)
          .send({ message: 'Validation error.', issues: error.format() })
      }

      return reply.status(500).send({ message: 'Internal server error' })
    }
  }
}
