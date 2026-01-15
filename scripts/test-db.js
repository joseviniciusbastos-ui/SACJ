const { PrismaClient } = require('@prisma/client');

async function main() {
    const prisma = new PrismaClient();
    try {
        console.log('Testing connection to database...');
        const userCount = await prisma.user.count();
        console.log(`Connection successful! User count: ${userCount}`);
    } catch (error) {
        console.error('Connection failed:');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
