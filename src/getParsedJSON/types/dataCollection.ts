import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class JobCountsType {
  @Field(() => Int)
  waiting: number;

  @Field(() => Int)
  active: number;

  @Field(() => Int)
  completed: number;

  @Field(() => Int)
  failed: number;
}

@ObjectType()
export class DataCollectionType {
  @Field()
  message: string;

  @Field(() => Int)
  percentage: number;

  @Field(() => JobCountsType)
  counts: JobCountsType;
}
