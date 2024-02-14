import Fastify from 'fastify'

import { newTransactionRoute } from './routes/new-transaction'
import { listTransactionsRoute } from './routes/list-transactions'

async function main() {
  const fastify = Fastify({
    logger: true,
  })

  fastify.get('/', (_, reply) => {
    return reply.send({ msg: 'teste' })
  })

  fastify.post('/clientes/:id/transacoes', newTransactionRoute)
  fastify.get('/clientes/:id/extrato', listTransactionsRoute)

  fastify.listen(
    { port: parseInt(process.env.PORT ?? '3000'), host: '0.0.0.0' },
    function (err) {
      if (err) {
        fastify.log.error(err)
        process.exit(1)
      }
    },
  )
}

main()
