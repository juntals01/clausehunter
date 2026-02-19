import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import { Contract } from '../entities/contract.entity';

async function seed() {
    try {
        await AppDataSource.initialize();
        console.log('Database connection established');

        const userRepo = AppDataSource.getRepository(User);
        const contractRepo = AppDataSource.getRepository(Contract);

        // Seed admin user
        const adminExists = await userRepo.findOne({ where: { email: 'admin@expirationreminderai.com' } });
        let admin: User;
        if (!adminExists) {
            const hash = await bcrypt.hash('admin123', 10);
            admin = userRepo.create({
                name: 'Admin User',
                email: 'admin@expirationreminderai.com',
                passwordHash: hash,
                role: 'admin',
                status: 'active',
                company: 'ExpirationReminderAI',
            });
            await userRepo.save(admin);
            console.log('Created admin user: admin@expirationreminderai.com / admin123');
        } else {
            admin = adminExists;
            console.log('Admin user already exists');
        }

        // Seed regular user
        const userExists = await userRepo.findOne({ where: { email: 'john@example.com' } });
        let user: User;
        if (!userExists) {
            const hash = await bcrypt.hash('user123', 10);
            user = userRepo.create({
                name: 'John Doe',
                email: 'john@example.com',
                passwordHash: hash,
                role: 'user',
                status: 'active',
                company: 'Acme Corp',
            });
            await userRepo.save(user);
            console.log('Created user: john@example.com / user123');
        } else {
            user = userExists;
            console.log('Regular user already exists');
        }

        // Seed contracts for the regular user
        const contractCount = await contractRepo.count();
        if (contractCount === 0) {
            const contracts = [
                {
                    originalFilename: 'gym-membership-2026.pdf',
                    vendor: 'FitLife Gym',
                    endDate: new Date('2026-06-30'),
                    noticeDays: 30,
                    autoRenews: true,
                    status: 'ready',
                    userId: user.id,
                },
                {
                    originalFilename: 'saas-subscription.pdf',
                    vendor: 'SaaS Platform Inc',
                    endDate: new Date('2026-12-31'),
                    noticeDays: 60,
                    autoRenews: true,
                    status: 'ready',
                    userId: user.id,
                },
                {
                    originalFilename: 'office-lease.pdf',
                    vendor: 'Downtown Properties',
                    endDate: new Date('2026-09-15'),
                    noticeDays: 90,
                    autoRenews: false,
                    status: 'ready',
                    userId: user.id,
                },
                {
                    originalFilename: 'cloud-hosting.pdf',
                    vendor: 'Cloud Hosting Co',
                    endDate: new Date('2026-03-18'),
                    noticeDays: 15,
                    autoRenews: true,
                    status: 'ready',
                    userId: user.id,
                },
            ];

            for (const data of contracts) {
                const contract = contractRepo.create(data);
                await contractRepo.save(contract);
                console.log(`Created contract: ${data.vendor}`);
            }
        } else {
            console.log('Contracts already seeded');
        }

        console.log('Seeding completed!');
        await AppDataSource.destroy();
    } catch (error) {
        console.error('Error seeding:', error);
        process.exit(1);
    }
}

seed();
