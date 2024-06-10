import { Test, TestingModule } from '@nestjs/testing';
import { QueueProcessor } from './queue.processor';
import { PrismaService } from '../prisma/prisma.service';
import { Job } from 'bull';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { xmlToJSON_DOMParser } from 'src/utils/xmltoJSON_DOMParser';

jest.mock('axios');
jest.mock('fs');
jest.mock('src/utils/xmltoJSON_DOMParser');

const mockPrisma = {
  make: {
    upsert: jest.fn(),
  },
  vehicleType: {
    createMany: jest.fn(),
  },
};

describe('QueueProcessor', () => {
  let processor: QueueProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueProcessor,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    processor = module.get<QueueProcessor>(QueueProcessor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleProcessing', () => {
    it('should process a job and save data to the database', async () => {
      const job: Job = {
        data: {
          items: [{ makeId: 12670, makeName: 'ZYBERGRAPH, LLC' }],
        },
        id: 1,
      } as any;

      (axios.get as jest.Mock).mockResolvedValue({
        data: '<Response><Results><VehicleTypesForMakeIds><VehicleTypeId>1</VehicleTypeId><VehicleTypeName>Type 1</VehicleTypeName></VehicleTypesForMakeIds></Results></Response>',
      });

      (xmlToJSON_DOMParser as jest.Mock).mockResolvedValue([
        { VehicleTypeId: '1', VehicleTypeName: 'Type 1' },
      ]);

      await processor.handleProcessing(job);

      expect(mockPrisma.make.upsert).toHaveBeenCalledWith({
        where: { makeId: 12670 },
        update: { makeId: 12670, makeName: 'ZYBERGRAPH, LLC' },
        create: { makeId: 12670, makeName: 'ZYBERGRAPH, LLC' },
      });

      expect(mockPrisma.vehicleType.createMany).toHaveBeenCalledWith({
        data: [
          {
            typeId: 1,
            typeName: 'Type 1',
            makeId: 12670,
          },
        ],
      });
    });

    it('should read data from local file if API fails', async () => {
      const job: Job = {
        data: {
          items: [{ makeId: 12670, makeName: 'ZYBERGRAPH, LLC' }],
        },
        id: 1,
      } as any;

      (axios.get as jest.Mock).mockRejectedValue({ response: { status: 403 } });
      (fs.readFileSync as jest.Mock).mockReturnValue(
        '<Response><Results><VehicleTypesForMakeIds><VehicleTypeId>1</VehicleTypeId><VehicleTypeName>Type 1</VehicleTypeName></VehicleTypesForMakeIds></Results></Response>',
      );

      (xmlToJSON_DOMParser as jest.Mock).mockResolvedValue([
        { VehicleTypeId: '1', VehicleTypeName: 'Type 1' },
      ]);

      await processor.handleProcessing(job);

      expect(mockPrisma.make.upsert).toHaveBeenCalledWith({
        where: { makeId: 12670 },
        update: { makeId: 12670, makeName: 'ZYBERGRAPH, LLC' },
        create: { makeId: 12670, makeName: 'ZYBERGRAPH, LLC' },
      });

      expect(mockPrisma.vehicleType.createMany).toHaveBeenCalledWith({
        data: [
          {
            typeId: 1,
            typeName: 'Type 1',
            makeId: 12670,
          },
        ],
      });

      expect(fs.readFileSync).toHaveBeenCalledWith(
        path.resolve(__dirname, '../../data/12670.xml'),
        'utf8',
      );
    });
  });
});
