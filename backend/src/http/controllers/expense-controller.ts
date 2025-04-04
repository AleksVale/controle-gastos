import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../../lib/prisma'
import { z } from 'zod'

export class ExpenseController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const createExpenseSchema = z.object({
      amount: z.number().positive(),
      description: z.string().optional(),
      date: z.string().datetime().optional(),
      categoryId: z.number().optional(),
      tagIds: z.array(z.number()).optional(),
    })

    try {
      const { amount, description, date, categoryId, tagIds } =
        createExpenseSchema.parse(request.body)
      const userId = request.user.sub

      const expense = await prisma.expense.create({
        data: {
          amount,
          description,
          date: date ? new Date(date) : new Date(),
          user: {
            connect: { id: Number(userId) },
          },
          ...(categoryId && {
            category: {
              connect: { id: categoryId },
            },
          }),
          ...(tagIds &&
            tagIds.length > 0 && {
              tags: {
                create: tagIds.map((tagId) => ({
                  tag: {
                    connect: { id: tagId },
                  },
                })),
              },
            }),
        },
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      })

      return reply.status(201).send(expense)
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
    const listExpensesSchema = z.object({
      page: z.string().optional().default('1'),
      perPage: z.string().optional().default('10'),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      categoryId: z.string().optional(),
    })

    try {
      const { page, perPage, startDate, endDate, categoryId } =
        listExpensesSchema.parse(request.query)
      const userId = request.user.sub

      const pageNumber = parseInt(page)
      const perPageNumber = parseInt(perPage)
      const skip = (pageNumber - 1) * perPageNumber

      const where = {
        userId: Number(userId),
        ...(startDate && endDate
          ? {
              date: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            }
          : {}),
        ...(categoryId ? { categoryId: Number(categoryId) } : {}),
      }

      const [expenses, total] = await Promise.all([
        prisma.expense.findMany({
          where,
          include: {
            category: true,
            tags: {
              include: {
                tag: true,
              },
            },
          },
          orderBy: {
            date: 'desc',
          },
          skip,
          take: perPageNumber,
        }),
        prisma.expense.count({ where }),
      ])

      return reply.status(200).send({
        data: expenses,
        meta: {
          total,
          page: pageNumber,
          perPage: perPageNumber,
          pageCount: Math.ceil(total / perPageNumber),
        },
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply
          .status(400)
          .send({ message: 'Validation error.', issues: error.format() })
      }

      return reply.status(500).send({ message: 'Internal server error' })
    }
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    const getExpenseSchema = z.object({
      id: z.string(),
    })

    try {
      const { id } = getExpenseSchema.parse(request.params)
      const userId = request.user.sub

      const expense = await prisma.expense.findFirst({
        where: {
          id: Number(id),
          userId: Number(userId),
        },
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      })

      if (!expense) {
        return reply.status(404).send({ message: 'Expense not found' })
      }

      return reply.status(200).send(expense)
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
    const updateExpenseParamsSchema = z.object({
      id: z.string(),
    })

    const updateExpenseBodySchema = z.object({
      amount: z.number().positive().optional(),
      description: z.string().optional(),
      date: z.string().datetime().optional(),
      categoryId: z.number().optional(),
      tagIds: z.array(z.number()).optional(),
    })

    try {
      const { id } = updateExpenseParamsSchema.parse(request.params)
      const { amount, description, date, categoryId, tagIds } =
        updateExpenseBodySchema.parse(request.body)
      const userId = request.user.sub

      const expense = await prisma.expense.findFirst({
        where: {
          id: Number(id),
          userId: Number(userId),
        },
      })

      if (!expense) {
        return reply.status(404).send({ message: 'Expense not found' })
      }

      // Atualizar tags se necessário
      if (tagIds) {
        // Remover associações existentes
        await prisma.tagsOnExpenses.deleteMany({
          where: {
            expenseId: Number(id),
          },
        })

        // Adicionar novas associações
        if (tagIds.length > 0) {
          await prisma.tagsOnExpenses.createMany({
            data: tagIds.map((tagId) => ({
              expenseId: Number(id),
              tagId,
            })),
          })
        }
      }

      const updatedExpense = await prisma.expense.update({
        where: {
          id: Number(id),
        },
        data: {
          amount,
          description,
          date: date ? new Date(date) : undefined,
          categoryId,
        },
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      })

      return reply.status(200).send(updatedExpense)
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
    const deleteExpenseSchema = z.object({
      id: z.string(),
    })

    try {
      const { id } = deleteExpenseSchema.parse(request.params)
      const userId = request.user.sub

      const expense = await prisma.expense.findFirst({
        where: {
          id: Number(id),
          userId: Number(userId),
        },
      })

      if (!expense) {
        return reply.status(404).send({ message: 'Expense not found' })
      }

      await prisma.expense.delete({
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
