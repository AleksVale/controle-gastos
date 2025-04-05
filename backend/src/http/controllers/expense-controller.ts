import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../../lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

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
      minAmount: z.string().optional(),
      maxAmount: z.string().optional(),
      description: z.string().optional(),
    })

    try {
      const {
        page,
        perPage,
        startDate,
        endDate,
        categoryId,
        minAmount,
        maxAmount,
        description,
      } = listExpensesSchema.parse(request.query)
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
        ...(minAmount || maxAmount
          ? {
              amount: {
                ...(minAmount ? { gte: parseFloat(minAmount) } : {}),
                ...(maxAmount ? { lte: parseFloat(maxAmount) } : {}),
              },
            }
          : {}),
        ...(description
          ? {
              description: {
                contains: description,
                mode: Prisma.QueryMode.insensitive,
              },
            }
          : {}),
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
    })

    try {
      const { id } = updateExpenseParamsSchema.parse(request.params)
      const { amount, description, date, categoryId } =
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

      const updatedExpense = await prisma.expense.update({
        where: { id: Number(id) },
        data: {
          amount,
          description,
          date: date ? new Date(date) : undefined,
          categoryId,
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

  async summary(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub

      // Total de despesas
      const totalExpenses = await prisma.expense.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          userId: Number(userId),
        },
      })

      // Número de categorias
      const categoryCount = await prisma.category.count({
        where: {
          userId: Number(userId),
        },
      })

      // Última despesa
      const lastExpense = await prisma.expense.findFirst({
        where: {
          userId: Number(userId),
        },
        orderBy: {
          date: 'desc',
        },
        select: {
          amount: true,
          description: true,
          date: true,
        },
      })

      return reply.status(200).send({
        totalExpenses: totalExpenses._sum.amount || 0,
        categoryCount,
        lastExpense: lastExpense
          ? {
              amount: lastExpense.amount,
              description: lastExpense.description,
              date: lastExpense.date,
            }
          : null,
      })
    } catch (error) {
      console.error('Erro ao gerar resumo:', error)
      return reply.status(500).send({ message: 'Erro interno do servidor' })
    }
  }

  async getTotalExpenses(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub

      const totalExpenses = await prisma.expense.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          userId: Number(userId),
        },
      })

      return reply.status(200).send({
        total: totalExpenses._sum.amount || 0,
      })
    } catch (error) {
      console.error('Erro ao calcular o total de despesas:', error)
      return reply.status(500).send({ message: 'Erro interno do servidor' })
    }
  }
}
