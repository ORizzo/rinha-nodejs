"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newTransactionRoute = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const paramsSchema = zod_1.z.object({
    id: zod_1.z.number({ coerce: true }),
});
const bodySchema = zod_1.z.object({
    valor: zod_1.z.number({ coerce: true }).int(),
    tipo: zod_1.z.enum(['c', 'd']),
    descricao: zod_1.z.string().min(1).max(10),
});
async function newTransactionRoute(request, reply) {
    try {
        const { id: userId } = paramsSchema.parse(request.params);
        const bodyParseResult = bodySchema.safeParse(request.body);
        if (!bodyParseResult.success) {
            return reply.status(422).send();
        }
        const { data: { valor, descricao, tipo }, } = bodyParseResult;
        const user = await prisma_1.prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) {
            return reply.status(404).send();
        }
        if (tipo === 'c') {
            const newBalance = user.balance + valor;
            await prisma_1.prisma.user.update({
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
            });
            return reply.send({ limite: user.limit, saldo: newBalance });
        }
        const newBalance = user.balance - valor;
        if (Math.abs(newBalance) > user.limit) {
            return reply.status(422).send();
        }
        try {
            await prisma_1.prisma.$transaction(async (tx) => {
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
                });
                if (Math.abs(author.balance) > author.limit) {
                    throw new Error(`Limit exceeded, transaction canceled.`);
                }
                return author;
            });
        }
        catch (err) {
            return reply.status(422).send();
        }
        return reply.send({ limite: user.limit, saldo: newBalance });
    }
    catch (err) {
        console.error(err);
        return reply.status(422).send();
    }
}
exports.newTransactionRoute = newTransactionRoute;
