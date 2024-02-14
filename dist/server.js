"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const new_transaction_1 = require("./routes/new-transaction");
const list_transactions_1 = require("./routes/list-transactions");
const prisma_1 = require("./lib/prisma");
async function main() {
    const fastify = (0, fastify_1.default)({
        logger: true,
    });
    async function dbWarmup() {
        const users = await prisma_1.prisma.user.findMany({});
        users.forEach(async (user) => {
            await prisma_1.prisma.transaction.create({
                data: {
                    value: 1,
                    type: 'c',
                    description: 'warmup',
                    userId: user.id,
                },
            });
        });
        await prisma_1.prisma.transaction.deleteMany();
        console.log('Db warmup completed');
    }
    fastify.get('/', (_, reply) => {
        return reply.send({ msg: 'teste' });
    });
    fastify.post('/clientes/:id/transacoes', new_transaction_1.newTransactionRoute);
    fastify.get('/clientes/:id/extrato', list_transactions_1.listTransactionsRoute);
    await dbWarmup();
    fastify.listen({ port: parseInt(process.env.PORT ?? '3000'), host: '0.0.0.0' }, function (err) {
        if (err) {
            fastify.log.error(err);
            process.exit(1);
        }
    });
}
main();
