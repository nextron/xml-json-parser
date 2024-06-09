import { ObjectType, Field, Int } from '@nestjs/graphql';
import { VehicleType } from './vehicle.type';

@ObjectType()
export class MakeType {
  @Field(() => Int)
  makeId: number;

  @Field()
  makeName: string;

  @Field(() => [VehicleType])
  vehicleTypes: VehicleType[];
}
