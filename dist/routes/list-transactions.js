"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransactionsRoute = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const paramsSchema = zod_1.z.object({
    id: zod_1.z.number({ coerce: true }),
});
async function listTransactionsRoute(request, reply) {
    try {
        const { id: userId } = paramsSchema.parse(request.params);
        const user = await prisma_1.prisma.user.findUnique({
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
        });
        if (!user) {
            return reply.status(404).send();
        }
        const lastTransactions = user.Transaction.map((transaction) => ({
            valor: transaction.value,
            tipo: transaction.type,
            descricao: transaction.description,
            realizada_em: transaction.createdAt,
        }));
        return reply.send({
            saldo: {
                total: user.balance,
                data_extrato: new Date().toISOString(),
                limite: user.limit,
            },
            ultimas_transacoes: lastTransactions,
        });
    }
    catch (err) {
        console.error(err);
        return reply.status(400).send();
    }
}
exports.listTransactionsRoute = listTransactionsRoute;
