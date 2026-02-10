import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const ORDER_PROTO_PATH = path.join(__dirname, './proto/order.proto');

const packageDefinition = protoLoader.loadSync(ORDER_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const orderProto: any = grpc.loadPackageDefinition(packageDefinition).order;

const client = new orderProto.OrderService(
  'localhost:50052',
  grpc.credentials.createInsecure()
);

function test() {
  const request = {
    product_id: '1', // Laptop
    quantity: 2,
  };

  console.log('Sending CreateOrder request:', request);

  client.createOrder(request, (err: any, response: any) => {
    if (err) {
      console.error('Error:', err.message);
      return;
    }
    console.log('Order Response:', response);
  });
}

test();
