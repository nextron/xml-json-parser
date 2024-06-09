import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../app.controller';
import { AppService } from '../app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { JsonParserService } from './jsonParser.service';
import { JsonParserResolver } from './jsonParser.resolver';

describe('JsonParser', () => {
  let jsonParserResolver: JsonParserResolver;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true,
        }),
      ],
      controllers: [AppController],
      providers: [AppService, JsonParserResolver, JsonParserService],
    }).compile();

    jsonParserResolver = app.get<JsonParserResolver>(JsonParserResolver);
  });

  describe('jsonParser', () => {
    it('should return parsed JSON', async () => {
      expect(await jsonParserResolver.getParsedJSON()).toBe('Hello World!');
    });
  });
});
