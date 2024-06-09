import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { JsonParserResolver } from './getParsedJSON/jsonParser.resolver';
import { JsonParserService } from './getParsedJSON/jsonParser.service';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { QueueModule } from './queue/queue.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    QueueModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService, JsonParserResolver, JsonParserService],
})
export class AppModule {}
