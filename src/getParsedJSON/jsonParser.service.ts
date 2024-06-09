import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PaginationInput } from './types/paginationInput.type';
import { PaginatedResponseType } from './types/paginatedResponse.type';

@Injectable()
export class JsonParserService {
  constructor(private prisma: PrismaService) {}
  async getJSON(
    paginationInput: PaginationInput,
  ): Promise<PaginatedResponseType> {
    // const makes = await this.prisma.make.findMany({
    //   skip: paginationInput?.skip || 0,
    //   take: paginationInput?.take || 10,
    //   include: {
    //     vehicleTypes: true,
    //   },
    // });

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
    const response = {
      data: data,
      pagination: {
        pageNumber: Math.floor(skip / take) + 1,
        totalItems: totalItems,
      },
    };
    return response;
  }
}
