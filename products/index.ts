import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { getProduct, listProducts } from '../lib/products';

const PROTO_PATH = path.join(__dirname, '../proto/product.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const productProto: any = grpc.loadPackageDefinition(packageDefinition).product;

function getProductHandler(call: any, callback: any) {
  const product = getProduct(call.request.id);
  if (product) {
    callback(null, product);
  } else {
    callback({
      code: grpc.status.NOT_FOUND,
      details: 'Product not found',
    });
  }
}

function listProductsHandler(call: any, callback: any) {
  callback(null, { products: listProducts() });
}

function main() {
  const server = new grpc.Server();
  server.addService(productProto.ProductService.service, {
    getProduct: getProductHandler,
    listProducts: listProductsHandler,
  });
  const port = '0.0.0.0:50051';
  server.bindAsync(port, grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`Product service running at ${boundPort}`);
  });
}

main();
