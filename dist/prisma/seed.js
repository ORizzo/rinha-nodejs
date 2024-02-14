"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
async function main() {
    try {
        const usersAlreadyCreated = (await prisma_1.prisma.user.findMany()).length > 0;
        if (usersAlreadyCreated) {
            return;
        }
        const users = [
            { id: 1, balance: 0, limit: 100000 },
            { id: 2, balance: 0, limit: 80000 },
            { id: 3, balance: 0, limit: 1000000 },
            { id: 4, balance: 0, limit: 10000000 },
            { id: 5, balance: 0, limit: 500000 },
        ];
        await prisma_1.prisma.user.createMany({
            data: users,
        });
    }
    catch (err) {
        console.error(err);
    }
}
main()
    .then(async () => {
    await prisma_1.prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma_1.prisma.$disconnect();
    process.exit(1);
});
