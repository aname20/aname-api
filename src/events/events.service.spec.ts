import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('EventsService', () => {
    let service: EventsService;
    let prisma: PrismaService;

    const mockPrisma = {
        event: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        dependent: {
            findFirst: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EventsService,
                {
                    provide: PrismaService,
                    useValue: mockPrisma,
                },
            ],
        }).compile();

        service = module.get<EventsService>(EventsService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create an event if user has permission', async () => {
            // Mock permission check success
            mockPrisma.dependent.findFirst.mockResolvedValue({ id: 'dep1' });

            const createDto = {
                dependentId: 'dep1',
                title: 'Checkup',
                date: new Date(),
                description: 'Routine checkup',
                doctorId: 1,
            };

            const resultEvent = { id: 1, ...createDto };
            mockPrisma.event.create.mockResolvedValue(resultEvent);

            const result = await service.create(createDto as any, 'user1');

            expect(mockPrisma.dependent.findFirst).toHaveBeenCalled();
            expect(mockPrisma.event.create).toHaveBeenCalled();
            expect(result).toEqual(resultEvent);
        });

        it('should throw ForbiddenException if user has no permission', async () => {
            // Mock permission check failure
            mockPrisma.dependent.findFirst.mockResolvedValue(null);

            const createDto = {
                dependentId: 'dep1',
                title: 'Checkup',
                date: new Date(),
                description: 'Routine checkup',
                doctorId: 1,
            };

            await expect(service.create(createDto as any, 'user1')).rejects.toThrow(ForbiddenException);
            expect(mockPrisma.event.create).not.toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should return all events for a valid dependent', async () => {
            mockPrisma.dependent.findFirst.mockResolvedValue({ id: 'dep1' });
            const events = [{ id: 1, title: 'Event 1' }];
            mockPrisma.event.findMany.mockResolvedValue(events);

            const result = await service.findAll('user1', 'dep1');

            expect(result).toEqual(events);
            expect(mockPrisma.event.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { dependentId: 'dep1' }
            }));
        });
    });

    describe('findOne', () => {
        it('should return an event if found and user has access', async () => {
            const event = { id: 1, dependentId: 'dep1' };
            mockPrisma.event.findUnique.mockResolvedValue(event);
            mockPrisma.dependent.findFirst.mockResolvedValue({ id: 'dep1' }); // access check

            const result = await service.findOne(1, 'user1');
            expect(result).toEqual(event);
        });

        it('should throw NotFoundException if event does not exist', async () => {
            mockPrisma.event.findUnique.mockResolvedValue(null);

            await expect(service.findOne(999, 'user1')).rejects.toThrow(NotFoundException);
        });
    });
});
