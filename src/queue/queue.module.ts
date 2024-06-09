import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueProcessor } from './queue.processor';
import { QueueService } from './queue.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost', // Redis server host
        port: 6379, // Redis server port
      },
    }),
    BullModule.registerQueue({
      name: 'json-processing',
    }),
    PrismaModule,
  ],
  providers: [QueueService, QueueProcessor],
  exports: [QueueService],
})
export class QueueModule {}
