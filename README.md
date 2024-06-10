# XML to JSON Parser Project

## Prerequisites

Before you begin, ensure you have the following installed:

- [Docker](https://www.docker.com/)

## Setup Instructions

### Step 1: Ensure PostgreSQL and Redis are Available

You can use Docker to run PostgreSQL and Redis containers.

- **PostgreSQL**:

  - Pull the PostgreSQL Docker image:
    ```bash
    docker pull postgres
    ```
  - Run the PostgreSQL container:
    ```bash
    docker run --name postgres -e POSTGRES_PASSWORD=mysecretpassword -d -p 5432:5432 postgres
    ```
    Replace `mysecretpassword` with your desired password.

- **Redis**:
  - Pull the Redis Docker image:
    ```bash
    docker pull redis
    ```
  - Run the Redis container:
    ```bash
    docker run --name redis -d -p 6379:6379 redis
    ```

### Step 2: Clone the Repository

```bash
git clone https://github.com/nextron/xml-json-parser.git
cd xml-json-parser
```

### Step 3: Install Dependencies

```bash
$ npm install
```

### Step 4: Configure Environment Variables

Create a .env file in the root of the project and add the necessary environment variables. Here is an example:

```bash
$DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/bimm?schema=public"
$REDIS_HOST=redis
$REDIS_PORT=6379
```

Replace mysecretpassword with your PostgreSQL password.

### Step 5: Push Prisma Schema to Database

```bash
npx prisma db push
```

### Step 6: Generate Prisma Client

```bash
npx prisma generate
```

Step 7: Run the Project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

### Step 8: Running Tests

To run the tests, use the following command:

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## How the Application Works

GraphQL Endpoint: `http://localhost:3000/graphql`
The primary GraphQL query for this application is getJSON.

## Query

```bash
query getJSON($paginationInput: PaginationInput, $refreshData: Boolean) {
  getJSON(paginationInput: $paginationInput, refreshData: $refreshData) {
    jobStatus {
      message
      percentage
      counts {
        waiting
        active
        completed
        failed
      }
    }
    pagination {
      totalItems
      pageNumber
    }
    data {
      makeId
      makeName
      vehicleTypes {
        typeId
        typeName
      }
    }
  }
}
```

## Example Input

```bash
{
  "paginationInput": {
    "skip": 1,
    "take": 2
  },
  "refreshData": false
}
```

## Example Response

```bash
{
  "data": {
    "getJSON": {
      "jobStatus": {
        "message": "completed",
        "percentage": 100,
        "counts": {
          "waiting": 0,
          "active": 0,
          "completed": 1,
          "failed": 0
        }
      },
      "pagination": {
        "totalItems": 6,
        "pageNumber": 1
      },
      "data": [
        {
          "makeId": 450,
          "makeName": "FREIGHTLINER",
          "vehicleTypes": [
            {
              "typeId": 3,
              "typeName": "Truck"
            },
            {
              "typeId": 5,
              "typeName": "Bus"
            },
            {
              "typeId": 7,
              "typeName": "Multipurpose Passenger Vehicle (MPV)"
            },
            {
              "typeId": 10,
              "typeName": "Incomplete Vehicle"
            }
          ]
        },
        {
          "makeId": 11713,
          "makeName": "ZZKNOWN",
          "vehicleTypes": [
            {
              "typeId": 1,
              "typeName": "Motorcycle"
            },
            {
              "typeId": 3,
              "typeName": "Truck"
            },
            {
              "typeId": 6,
              "typeName": "Trailer"
            }
          ]
        }
      ]
    }
  }
}

```

### Application Logic

1. Initialization:

- The query getJSON checks if there is any data in the database.
  If there are no rows in the database, it triggers the data collection process.
- An explicit flag (refreshData) in the query can also trigger the data collection process.

2. Data Collection:

- When data collection is triggered, the Redis queue is cleared.
  The application fetches all vehicle makes from the API: `https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML`.
- If the API throws an error, it fetches the XML file from a local path: `../../data/getallmakes.xml`.
- The fetched XML data is transformed into JSON using one of two available transformers: xml2js or DOMParser.

3. Batch Processing:

- Once all vehicle makes are available, they are divided into batches of 25.
- Jobs are created for each batch and added to the queue.

4. Queue Processing:

- The queue processor handles each job by saving the vehicle makes into the Make table in the database.
- For each vehicle make, it fetches the vehicle types from the API: `https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId/${makeId}?format=xml`.
- The fetched vehicle types are transformed into JSON and saved into the VehicleType table in the database.
- This process continues until all jobs are completed.

5. Job Status:

- The status of the jobs can be found in the response of the getJSON query.
- The response includes the job status, pagination information, and the transformed data.
