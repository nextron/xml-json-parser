import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class VehicleType {
  @Field(() => Int)
  typeId: number;

  @Field()
  typeName: string;
}
