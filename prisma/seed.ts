import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs' // assuming bcryptjs is used, need to check package.json or install it. 
// If not available, I might need to check what they use for hashing. 
// auth.ts usually has the logic. 

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@example.com'
    const password = 'admin'
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            name: 'Admin',
            password_hash: hashedPassword,
        },
    })

    console.log({ user })
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
