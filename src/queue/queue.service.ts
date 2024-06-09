import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import axios from 'axios';
import { DOMParser } from 'xmldom';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('json-processing') private queue: Queue) {}

  async triggerDataCollection() {
    // before creating a new queue clear the old one.
    await this.clearQueue();
    // fetch all the make ids
    const allMakesResponse = await axios.get(
      'https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML',
    );

    // // fetch all the models for each make id
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(allMakesResponse.data, 'text/xml');
    const resultsElement = xmlDoc.getElementsByTagName('Results')[0];

    const allVehicleMakesElements =
      resultsElement.getElementsByTagName('AllVehicleMakes');
    const vehicleMakes = [];
    // Extract the names of all makes into an array
    for (let i = 0; i < allVehicleMakesElements.length; i++) {
      const make = allVehicleMakesElements[i];
      const vehicleMake = {
        makeId: parseInt(
          make.getElementsByTagName('Make_ID')[0].textContent.trim(),
        ),
        makeName: make.getElementsByTagName('Make_Name')[0].textContent.trim(),
      };
      vehicleMakes.push(vehicleMake);
    }
    // Batch the vehicle makes into jobs of 25 items each
    const batchSize = 25;
    const totalJobs = Math.ceil(vehicleMakes.length / batchSize);
    for (let i = 0; i < vehicleMakes.length; i += batchSize) {
      const batch = vehicleMakes.slice(i, i + batchSize);
      await this.addJob({ items: batch, totalJobs });
    }
  }

  async addJob(data) {
    const job = await this.queue.add(data, {
      attempts: 3,
      backoff: 5000,
    });
    return job.id;
  }

  async getOverallJobStatus() {
    const jobCounts = await this.queue.getJobCounts();
    const totalJobs =
      jobCounts.waiting +
      jobCounts.active +
      jobCounts.completed +
      jobCounts.failed;
    const completedJobs = jobCounts.completed + jobCounts.failed;

    const progress = Math.round((completedJobs / totalJobs) * 100);

    return {
      message: progress === 100 ? 'completed' : 'in progress',
      percentage: progress,
      counts: {
        waiting: jobCounts.waiting,
        active: jobCounts.active,
        completed: jobCounts.completed,
        failed: jobCounts.failed,
        delayed: jobCounts.delayed,
      },
    };
  }
  async clearQueue() {
    await this.queue.clean(0, 'completed');
    await this.queue.clean(0, 'wait');
    await this.queue.clean(0, 'active');
    await this.queue.clean(0, 'delayed');
    await this.queue.clean(0, 'failed');
    await this.queue.clean(0, 'paused');
  }
}
