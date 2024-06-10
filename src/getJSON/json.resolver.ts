import { Resolver, Query, Args } from '@nestjs/graphql';
import { JsonService } from './json.service';
import { PaginationInput } from './types/paginationInput.type';
import { PaginatedResponseType } from './types/paginatedResponse.type';

@Resolver('JsonParser')
export class JsonResolver {
  constructor(private jsonService: JsonService) {}

  @Query(() => PaginatedResponseType, {
    name: 'getJSON',
  })
  async getJSON(
    @Args('paginationInput', { nullable: true })
    paginationInput: PaginationInput,
    @Args('refreshData', { nullable: true, defaultValue: false })
    refreshData: boolean,
  ): Promise<PaginatedResponseType> {
    return this.jsonService.getJSON(paginationInput, refreshData);
  }
}
