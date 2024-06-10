import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { xmlToJSON_DOMParser } from 'src/utils/xmltoJSON_DOMParser';
import * as fs from 'fs';
import * as path from 'path';

@Processor('json-processing')
export class QueueProcessor {
  constructor(private prisma: PrismaService) {}

  @Process()
  async handleProcessing(job: Job) {
    const { items } = job.data;
    //vehicle makes upsert Operations
    const upsertOperations = items.map((item) =>
      this.prisma.make.upsert({
        where: { makeId: item.makeId },
        update: item,
        create: item,
      }),
    );
    //executing all the operations
    await Promise.all(upsertOperations);

    const vehicleTypePromises = items.map(async (item) => {
      const makeId = item.makeId;
      let vehicleTypeResponse;
      // added local files as getting 403 response from the API.
      await axios
        .get(
          `https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId/${makeId}?format=xml`,
        )
        .then((data) => (vehicleTypeResponse = data))
        .catch(() => {
          vehicleTypeResponse = {
            data: fs.readFileSync(
              path.resolve(__dirname, `../../data/${makeId}.xml`),
              'utf8',
            ),
          };
        });
      const xml2jsonData = await xmlToJSON_DOMParser(
        vehicleTypeResponse.data,
        'Results',
        'VehicleTypesForMakeIds',
        ['VehicleTypeId', 'VehicleTypeName'],
      );
      let vehicleTypes = [];
      vehicleTypes = xml2jsonData.map((vehicle: any) => ({
        typeId: parseInt(vehicle.VehicleTypeId),
        typeName: vehicle.VehicleTypeName,
        makeId: makeId,
      }));
      return vehicleTypes;
    });
    const allVehicleTypes = await Promise.all(vehicleTypePromises);
    await this.prisma.vehicleType.createMany({
      data: allVehicleTypes.flat(),
    });
    // The job is implicitly marked as completed when this function returns
    return;
  }
}
