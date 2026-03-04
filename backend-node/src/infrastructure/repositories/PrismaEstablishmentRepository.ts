import prisma from '../database/prisma.service';
import { IEstablishmentRepository } from '../../domain/repositories/IEstablishmentRepository';
import { Establishment } from '../../domain/entities/Establishment';

export class PrismaEstablishmentRepository implements IEstablishmentRepository {
    async findById(id: string): Promise<Establishment | null> {
        const data = await prisma.establishment.findUnique({ where: { id } });
        if (!data) return null;
        return this.mapToDomain(data);
    }

    async findAll(): Promise<Establishment[]> {
        const data = await prisma.establishment.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });
        return data.map(this.mapToDomain);
    }

    async save(establishment: Establishment): Promise<Establishment> {
        const data = await prisma.establishment.create({
            data: {
                id: establishment.id,
                name: establishment.name,
                description: establishment.description,
                category: establishment.category,
                managerId: establishment.managerId,
                isActive: establishment.isActive,
                createdAt: establishment.createdAt,
                updatedAt: establishment.updatedAt,
            },
        });
        return this.mapToDomain(data);
    }

    async update(establishment: Establishment): Promise<Establishment> {
        if (!establishment.id) throw new Error('Cannot update establishment without ID');

        const data = await prisma.establishment.update({
            where: { id: establishment.id },
            data: {
                name: establishment.name,
                description: establishment.description,
                category: establishment.category,
                managerId: establishment.managerId,
                isActive: establishment.isActive,
                updatedAt: establishment.updatedAt,
            },
        });
        return this.mapToDomain(data);
    }

    private mapToDomain(data: any): Establishment {
        return Establishment.create({
            id: data.id,
            name: data.name,
            description: data.description,
            category: data.category,
            managerId: data.managerId,
            isActive: data.isActive,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        });
    }
}
