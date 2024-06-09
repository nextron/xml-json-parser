import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import axios from 'axios';
import { DOMParser } from 'xmldom';
import { PrismaService } from '../prisma/prisma.service';

@Processor('json-processing')
export class QueueProcessor {
  constructor(private prisma: PrismaService) {}

  @Process()
  async handleProcessing(job: Job) {
    console.log('here at handle processiing');
    const { items } = job.data;
    const totalItems = items.length;

    for (let i = 0; i < totalItems; i++) {
      const item = items[i];
      // Check if item exists in the DB and update or create
      await this.prisma.make.upsert({
        where: { makeId: item.makeId },
        update: item,
        create: item,
      });

      // Fetch vehicle types for the make
      const makeId = item.makeId;
      const vehicleTypeResponse = await axios.get(
        `https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId/${makeId}?format=xml`,
      );
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(
        vehicleTypeResponse.data,
        'text/xml',
      );
      const resultsElement = xmlDoc.getElementsByTagName('Results')[0];
      const vehicleTypesForMakeIdsElements =
        resultsElement.getElementsByTagName('VehicleTypesForMakeIds');

      // Save vehicle types to the database
      for (let j = 0; j < vehicleTypesForMakeIdsElements.length; j++) {
        const vehicleType = vehicleTypesForMakeIdsElements[j];
        await this.prisma.vehicleType.create({
          data: {
            typeId: parseInt(
              vehicleType
                .getElementsByTagName('VehicleTypeId')[0]
                .textContent.trim(),
            ),
            typeName: vehicleType
              .getElementsByTagName('VehicleTypeName')[0]
              .textContent.trim(),
            makeId: makeId,
          },
        });
      }
    }
    console.log('here at handle processiing Completed');
    // The job is implicitly marked as completed when this function returns
    return;
  }
}
