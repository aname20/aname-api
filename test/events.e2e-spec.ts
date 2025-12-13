import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ForbiddenException } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('EventsController (e2e)', () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let jwtService: JwtService;

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
        $transaction: jest.fn((cb) => cb(mockPrisma)),
    };

    // Mock a valid JWT token
    const mockUser = { sub: 'user1', email: 'test@example.com' };
    let accessToken: string;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(PrismaService)
            .useValue(mockPrisma)
            .compile();

        app = moduleFixture.createNestApplication();
        jwtService = moduleFixture.get<JwtService>(JwtService);
        prismaService = moduleFixture.get<PrismaService>(PrismaService);

        await app.init();

        // Generate token for authentication
        accessToken = jwtService.sign(mockUser, { secret: process.env.JWT_SECRET || 'secretKey' });
        // Note: ensure JWT_SECRET matches what AuthModule uses or mock ConfigService if needed. 
        // If AuthModule uses a hardcoded secret or env, we need to match it.
        // For now, assuming env or default.
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('/events (GET) - Success', async () => {
        mockPrisma.dependent.findFirst.mockResolvedValue({ id: '550e8400-e29b-41d4-a716-446655440000' });
        mockPrisma.event.findMany.mockResolvedValue([
            { id: 1, title: 'Event 1', dependentId: '550e8400-e29b-41d4-a716-446655440000', date: new Date().toISOString() }
        ]);

        return request(app.getHttpServer())
            .get('/events')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body[0].title).toBe('Event 1');
            });
    });

    it('/events (POST) - Success', async () => {
        mockPrisma.dependent.findFirst.mockResolvedValue({ id: '550e8400-e29b-41d4-a716-446655440000' });
        const newEvent = {
            dependentId: '550e8400-e29b-41d4-a716-446655440000',
            title: 'New Event',
            date: new Date().toISOString(),
            description: 'Desc',
            doctorId: 1
        };

        mockPrisma.event.create.mockResolvedValue({ id: 2, ...newEvent });

        return request(app.getHttpServer())
            .post('/events')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(newEvent)
            .expect(201)
            .expect((res) => {
                expect(res.body.title).toBe('New Event');
            });
    });

    it('/events (POST) - Forbidden', async () => {
        // Scenario where user has no access to dependent
        mockPrisma.dependent.findFirst.mockResolvedValue(null);

        const newEvent = {
            dependentId: '550e8400-e29b-41d4-a716-446655440000',
            title: 'New Event',
            date: new Date().toISOString(),
            description: 'Desc',
            doctorId: 1
        };

        return request(app.getHttpServer())
            .post('/events')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(newEvent)
            .expect(403);
    });
});
