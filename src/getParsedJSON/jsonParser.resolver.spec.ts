import { Test, TestingModule } from '@nestjs/testing';
import { JsonParserService } from './jsonParser.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueueService } from 'src/queue/queue.service';

describe('JsonParser', () => {
  let jsonParserService: JsonParserService;
  let prismaService: PrismaService;
  let queueService: QueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JsonParserService,
        {
          provide: PrismaService,
          useValue: {
            make: {
              count: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: QueueService,
          useValue: {
            triggerDataCollection: jest.fn(),
            getOverallJobStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    jsonParserService = module.get<JsonParserService>(JsonParserService);
    prismaService = module.get<PrismaService>(PrismaService);
    queueService = module.get<QueueService>(QueueService);
  });

  describe('getJSON', () => {
    it('should return paginated data with job status', async () => {
      const mockData = [{ id: 1, vehicleTypes: [] }];
      const mockPaginationInput = { skip: 0, take: 10 };

      (prismaService.make.count as jest.Mock).mockResolvedValue(1);
      (prismaService.make.findMany as jest.Mock).mockResolvedValue(mockData);
      (queueService.getOverallJobStatus as jest.Mock).mockResolvedValue({
        status: 'complete',
      });

      const result = await jsonParserService.getJSON(
        mockPaginationInput,
        false,
      );

      expect(result).toEqual({
        jobStatus: { status: 'complete' },
        data: mockData,
        pagination: { pageNumber: 1, totalItems: 1 },
      });

      expect(prismaService.make.count).toHaveBeenCalled();
      expect(prismaService.make.findMany).toHaveBeenCalledWith({
        skip: mockPaginationInput.skip,
        take: mockPaginationInput.take,
        include: { vehicleTypes: true },
      });
    });

    it('should trigger data collection if there is no data or refreshData is true', async () => {
      (prismaService.make.count as jest.Mock).mockResolvedValue(0);
      (prismaService.make.findMany as jest.Mock).mockResolvedValue([]);
      (queueService.getOverallJobStatus as jest.Mock).mockResolvedValue({
        status: 'in_progress',
      });

      await jsonParserService.getJSON({ skip: 0, take: 10 }, true);

      expect(queueService.triggerDataCollection).toHaveBeenCalled();
    });
  });
});
