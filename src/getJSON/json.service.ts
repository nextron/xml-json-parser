import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationInput } from './types/paginationInput.type';
import { PaginatedResponseType } from './types/paginatedResponse.type';
import { QueueService } from 'src/queue/queue.service';

@Injectable()
export class JsonService {
  constructor(
    private prisma: PrismaService,
    private queue: QueueService,
  ) {}
  async getJSON(
    paginationInput: PaginationInput,
    refreshData: boolean,
  ): Promise<PaginatedResponseType> {
    const { skip = 0, take = 10 } = paginationInput || {};
    const [totalItems, data] = await Promise.all([
      this.prisma.make.count({}),
      this.prisma.make.findMany({
        skip,
        take,
        include: {
          vehicleTypes: true,
        },
      }),
    ]);
    // if there is no data in the database trigger data collection
    if (totalItems === 0 || refreshData) {
      await this.queue.triggerDataCollection();
    }
    const response = {
      jobStatus: {
        ...(await this.queue.getOverallJobStatus()),
      },
      data: data,
      pagination: {
        pageNumber: Math.floor(skip / take) + 1,
        totalItems: totalItems,
      },
    };
    return response;
  }
}
