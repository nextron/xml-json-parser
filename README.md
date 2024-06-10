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
npx prisma db push
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

### Explanation

1. **Prerequisites**: Ensure Docker is installed.
2. **Using Docker**: Instructions to pull and run PostgreSQL and Redis containers using Docker.
3. **Clone the Repository**: Instructions to clone the repository.
4. **Install Dependencies**: Install Node.js dependencies using `npm install`.
5. **Configure Environment Variables**: Set up the `.env` file with PostgreSQL and Redis connection strings.
6. **Push Prisma Schema**: Push the Prisma schema to the PostgreSQL database.
7. **Generate Prisma Client**: Generate the Prisma client.
8. **Run the Project**: Start the project using `npm run start`.
9. **Running Tests**: Instructions to run tests using `npm run test`.

This should help set up the project and get it running smoothly with Docker. Let me know if you need any more details or further adjustments!
