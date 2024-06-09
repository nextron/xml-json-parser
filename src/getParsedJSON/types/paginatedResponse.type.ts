import { ObjectType, Field } from '@nestjs/graphql';
import { MakeType } from './make.type';
import { PaginationInfoType } from './paginationInfo.type';
import { DataCollectionType } from './dataCollection';

@ObjectType()
export class PaginatedResponseType {
  @Field(() => [MakeType])
  data: MakeType[];

  @Field(() => PaginationInfoType)
  pagination: PaginationInfoType;

  @Field(() => DataCollectionType)
  jobStatus: DataCollectionType;
}
