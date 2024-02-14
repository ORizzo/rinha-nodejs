import { FastifyReply, FastifyRequest } from 'fastify'

import { z } from 'zod'
import { prisma } from '../lib/prisma'

const paramsSchema = z.object({
  id: z.number({ coerce: true }),
})

export async function listTransactionsRoute(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { id: userId } = paramsSchema.parse(request.params)

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        Transaction: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!user) {
      return reply.status(404).send()
    }

    const lastTransactions = user.Transaction.map((transaction) => ({
      valor: transaction.value,
      tipo: transaction.type,
      descricao: transaction.description,
      realizada_em: transaction.createdAt,
    }))

    return reply.send({
      saldo: {
        total: user.balance,
        data_extrato: new Date().toISOString(),
        limite: user.limit,
      },
      ultimas_transacoes: lastTransactions,
    })
  } catch (err) {
    console.error(err)

    return reply.status(400).send()
  }
}
