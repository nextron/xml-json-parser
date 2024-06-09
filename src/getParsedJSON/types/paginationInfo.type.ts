import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class PaginationInfoType {
  @Field(() => Int)
  totalItems: number;

  @Field(() => Int)
  pageNumber: number;
}
