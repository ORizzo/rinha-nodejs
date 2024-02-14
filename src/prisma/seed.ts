import { User } from '@prisma/client'
import { prisma } from '../lib/prisma'

async function main() {
  try {
    const usersAlreadyCreated = (await prisma.user.findMany()).length > 0

    if (usersAlreadyCreated) {
      return
    }

    const users: User[] = [
      { id: 1, balance: 0, limit: 100000 },
      { id: 2, balance: 0, limit: 80000 },
      { id: 3, balance: 0, limit: 1000000 },
      { id: 4, balance: 0, limit: 10000000 },
      { id: 5, balance: 0, limit: 500000 },
    ]

    await prisma.user.createMany({
      data: users,
    })
  } catch (err) {
    console.error(err)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
