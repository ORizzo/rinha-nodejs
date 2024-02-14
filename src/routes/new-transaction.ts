import { FastifyReply, FastifyRequest } from 'fastify'

import { z } from 'zod'
import { prisma } from '../lib/prisma'

const paramsSchema = z.object({
  id: z.number({ coerce: true }),
})

const bodySchema = z.object({
  valor: z.number({ coerce: true }).int(),
  tipo: z.enum(['c', 'd']),
  descricao: z.string().min(1).max(10),
})

export async function newTransactionRoute(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { id: userId } = paramsSchema.parse(request.params)
    const bodyParseResult = bodySchema.safeParse(request.body)

    if (!bodyParseResult.success) {
      return reply.status(422).send()
    }

    const {
      data: { valor, descricao, tipo },
    } = bodyParseResult

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

    if (!user) {
      return reply.status(404).send()
    }

    if (tipo === 'c') {
      const newBalance = user.balance + valor

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          balance: { increment: valor },
          Transaction: {
            create: {
              description: descricao,
              type: 'c',
              value: valor,
            },
          },
        },
      })

      return reply.send({ limite: user.limit, saldo: newBalance })
    }

    const newBalance = user.balance - valor

    if (Math.abs(newBalance) > user.limit) {
      return reply.status(422).send()
    }

    try {
      await prisma.$transaction(async (tx) => {
        const author = await tx.user.update({
          data: {
            balance: {
              decrement: valor,
            },
            Transaction: {
              create: {
                description: descricao,
                type: 'd',
                value: valor,
              },
            },
          },
          where: { id: userId },
        })

        if (Math.abs(author.balance) > author.limit) {
          throw new Error('Limit exceeded')
        }

        return author
      })
    } catch (err) {
      return reply.status(422).send()
    }

    return reply.send({ limite: user.limit, saldo: newBalance })
  } catch (err) {
    console.error(err)

    return reply.status(422).send()
  }
}
