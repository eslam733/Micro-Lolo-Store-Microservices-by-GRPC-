import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const ORDER_PROTO_PATH = path.join(__dirname, '../proto/order.proto');
const PRODUCT_PROTO_PATH = path.join(__dirname, '../proto/product.proto');

// Load Order Proto
const orderPackageDefinition = protoLoader.loadSync(ORDER_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const orderProto: any = grpc.loadPackageDefinition(orderPackageDefinition).order;

// Load Product Proto (for the client)
const productPackageDefinition = protoLoader.loadSync(PRODUCT_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const productProto: any = grpc.loadPackageDefinition(productPackageDefinition).product;

// Product Service Client
const productClient = new productProto.ProductService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

function createOrder(call: any, callback: any) {
  const { product_id, quantity } = call.request;

  console.log(`Creating order for product ${product_id} with quantity ${quantity}`);

  // Call Product service to get product details
  productClient.getProduct({ id: product_id }, (err: any, product: any) => {
    if (err) {
      console.error('Error fetching product:', err);
      callback({
        code: grpc.status.INTERNAL,
        details: 'Failed to fetch product information',
      });
      return;
    }

    const totalPrice = product.price * quantity;
    const orderResponse = {
      id: Math.random().toString(36).substring(7),
      status: 'CREATED',
      total_price: totalPrice,
    };

    console.log(`Order created successfully: ${orderResponse.id}`);
    callback(null, orderResponse);
  });
}

function main() {
  const server = new grpc.Server();
  server.addService(orderProto.OrderService.service, { createOrder });
  const port = '0.0.0.0:50052';
  server.bindAsync(port, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`Order service running at ${port}`);
    server.start();
  });
}

main();
