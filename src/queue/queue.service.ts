import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
// import { xmlToJSON_xml2js } from 'src/utils/xmlToJSON_xml2js';
import { xmlToJSON_DOMParser } from 'src/utils/xmltoJSON_DOMParser';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('json-processing') private queue: Queue) {}

  async triggerDataCollection() {
    // before creating a new queue clear the old one.
    await this.clearQueue();
    // fetch all the make ids
    let allMakesResponse;
    // local ip was getting 403 forbidden erorr made a local copy in case the API fails using the local copy of the XML file.
    await axios
      .get('https://vpiasc.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML')
      .then((data) => (allMakesResponse = data))
      .catch(() => {
        allMakesResponse = {
          data: fs.readFileSync(
            path.resolve(__dirname, '../../data/getallmakes.xml'),
            'utf8',
          ),
        };
      });
    let vehicleMakes = [];
    // with xml2js
    // const xml2jsonData = (await xmlToJSON_xml2js(allMakesResponse.data)).Results
    //   .AllVehicleMakes;
    // with Dom Parser
    const xml2jsonData = await xmlToJSON_DOMParser(
      allMakesResponse.data,
      'Results',
      'AllVehicleMakes',
      ['Make_ID', 'Make_Name'],
    );
    vehicleMakes = xml2jsonData.map((make: any) => ({
      makeId: parseInt(make.Make_ID),
      makeName: make.Make_Name,
    }));
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
    let progress = 100;
    if (totalJobs > 0) {
      progress = Math.round((completedJobs / totalJobs) * 100);
    }
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
