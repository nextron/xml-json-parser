import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from './queue.service';
import { getQueueToken } from '@nestjs/bull';
import axios from 'axios';
import * as fs from 'fs';

jest.mock('axios');
jest.mock('fs');

const mockQueue = {
  add: jest.fn().mockResolvedValue({ id: 1 }),
  clean: jest.fn(),
  getJobCounts: jest.fn().mockResolvedValue({
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
    delayed: 0,
  }),
};

describe('QueueService', () => {
  let service: QueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        { provide: getQueueToken('json-processing'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('triggerDataCollection', () => {
    it('should clear the queue and fetch data from API', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: '<Response><Results><AllVehicleMakes><Make_ID>12670</Make_ID><Make_Name>ZYBERGRAPH, LLC</Make_Name></AllVehicleMakes></Results></Response>',
      });

      await service.triggerDataCollection();

      expect(mockQueue.clean).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalled();
      expect(mockQueue.add).toHaveBeenCalled();
    });

    it('should clear the queue and read data from local file if API fails', async () => {
      (axios.get as jest.Mock).mockRejectedValue({ response: { status: 403 } });
      (fs.readFileSync as jest.Mock).mockReturnValue(
        '<Response><Results><AllVehicleMakes><Make_ID>12670</Make_ID><Make_Name>ZYBERGRAPH, LLC</Make_Name></AllVehicleMakes></Results></Response>',
      );

      await service.triggerDataCollection();

      expect(mockQueue.clean).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalled();
      expect(mockQueue.add).toHaveBeenCalled();
    });
  });

  describe('clearQueue', () => {
    it('should clean the Redis queue', async () => {
      await service.clearQueue();

      expect(mockQueue.clean).toHaveBeenCalled();
    });
  });

  describe('getOverallJobStatus', () => {
    it('should return the overall job status', async () => {
      const result = await service.getOverallJobStatus();

      expect(result).toEqual({
        message: 'completed',
        percentage: 100,
        counts: {
          waiting: 0,
          active: 0,
          completed: 0,
          failed: 0,
          delayed: 0,
        },
      });
      expect(mockQueue.getJobCounts).toHaveBeenCalled();
    });
  });
});
