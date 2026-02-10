import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(__dirname, '../proto/product.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const productProto: any = grpc.loadPackageDefinition(packageDefinition).product;

const products = [
  { id: '1', name: 'Golden Retriever', price: 1200.00 },
  { id: '2', name: 'French Bulldog', price: 2500.00 },
  { id: '3', name: 'Husky', price: 1500.00 },
];

function getProduct(call: any, callback: any) {
  const product = products.find((p) => p.id === call.request.id);
  if (product) {
    callback(null, product);
  } else {
    callback({
      code: grpc.status.NOT_FOUND,
      details: 'Product not found',
    });
  }
}

function main() {
  const server = new grpc.Server();
  server.addService(productProto.ProductService.service, { getProduct });
  const port = '0.0.0.0:50051';
  server.bindAsync(port, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`Product service running at ${port}`);
    server.start();
  });
}

main();
