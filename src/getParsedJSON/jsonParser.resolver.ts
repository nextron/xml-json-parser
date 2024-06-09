import { Resolver, Query, Args } from '@nestjs/graphql';
import { JsonParserService } from './jsonParser.service';
import { PaginationInput } from './types/paginationInput.type';
import { PaginatedResponseType } from './types/paginatedResponse.type';

@Resolver('JsonParser')
export class JsonParserResolver {
  constructor(private jsonParserService: JsonParserService) {}

  @Query(() => PaginatedResponseType, {
    name: 'getParsedJSON',
  })
  async getParsedJSON(
    @Args('paginationInput', { nullable: true })
    paginationInput: PaginationInput,
    @Args('refreshData', { nullable: true, defaultValue: false })
    refreshData: boolean,
  ): Promise<PaginatedResponseType> {
    return this.jsonParserService.getJSON(paginationInput, refreshData);
  }
}
