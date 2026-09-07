# Micro Lolo Store - Buy Dogs (gRPC Demo)

This project demonstrates a simple microservices architecture using gRPC and Node.js, themed as a dog store.

## Components

1.  **Products Service**: Manages product data and provides an endpoint to fetch product details by ID. (Port: 50051)
2.  **Orders Service**: Manages orders. When creating an order, it calls the **Products Service** via gRPC to get the product price and calculate the total. (Port: 50052)
3.  **UI Gateway (BFF)**: An Express server that acts as a bridge between the Web UI and the gRPC microservices. (Port: 3000)
4.  **Test Client**: A simple script to simulate a client making a request to the Orders Service.

## Prerequisites

- Node.js (v14 or later)
- npm

## How to Run

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Start the Products Service**:
    Open a terminal and run:
    ```bash
    npm run start:products
    ```

3.  **Start the Orders Service**:
    Open another terminal and run:
    ```bash
    npm run start:orders
    ```

4.  **Start the UI Gateway**:
    Open a third terminal and run:
    ```bash
    npm run start:gateway
    ```

5.  **Access the UI**:
    Open your browser and navigate to: `http://localhost:3000`

6.  **Run the Test Client (Optional)**:
    Open a fourth terminal and run:
    ```bash
    npm run test:client
    ```

## Deploy on Vercel

Vercel runs this app as a single serverless Express function. It cannot host the long-lived gRPC servers on ports 50051/50052, so production uses the same product and order logic **in-process** (the `VERCEL` environment variable is set automatically).

Local gRPC development is unchanged. To preview the Vercel-style in-process mode locally:

```bash
npm run start:gateway:vercel
```

Then open `http://localhost:3000`.

### Deploy from GitHub

1. Push this repository to GitHub (already done if you are on this repo).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Leave the defaults: Vercel detects Express from `server.ts` and serves static files from `public/`.
4. Click **Deploy**.

No build command, output directory, or environment variables are required.

### Deploy with Vercel CLI

```bash
npm i -g vercel
vercel
```

Use `vercel --prod` to promote a preview to production.

## Learning gRPC with this project

- **Proto Files**: Check the `proto/` directory to see how services and messages are defined.
- **Service Implementation**: Look at `products/index.ts` to see how a gRPC server is implemented.
- **Client Implementation**: Look at `orders/index.ts` to see how a microservice acts as a client to another service.
- **Dynamic Loading**: Notice how we use `@grpc/proto-loader` to load `.proto` files at runtime without a manual compilation step.
