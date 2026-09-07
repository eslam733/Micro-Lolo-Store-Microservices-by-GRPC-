import express from 'express';
import cors from 'cors';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { listProducts } from '../lib/products';
import { createOrder, ProductNotFoundError } from '../lib/orders';
import { useInProcessServices } from '../lib/runtime';

const app = express();
const port = Number(process.env.PORT) || 3000;
const inProcess = useInProcessServices();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const PROTO_LOADER_OPTIONS = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

function loadGrpcClients() {
  const ORDER_PROTO_PATH = path.join(__dirname, '../proto/order.proto');
  const PRODUCT_PROTO_PATH = path.join(__dirname, '../proto/product.proto');

  const orderPackageDefinition = protoLoader.loadSync(ORDER_PROTO_PATH, PROTO_LOADER_OPTIONS);
  const orderProto: any = grpc.loadPackageDefinition(orderPackageDefinition).order;
  const orderClient = new orderProto.OrderService(
    process.env.ORDERS_GRPC_ADDR || 'localhost:50052',
    grpc.credentials.createInsecure()
  );

  const productPackageDefinition = protoLoader.loadSync(PRODUCT_PROTO_PATH, PROTO_LOADER_OPTIONS);
  const productProto: any = grpc.loadPackageDefinition(productPackageDefinition).product;
  const productClient = new productProto.ProductService(
    process.env.PRODUCTS_GRPC_ADDR || 'localhost:50051',
    grpc.credentials.createInsecure()
  );

  return { orderClient, productClient };
}

const grpcClients = inProcess ? null : loadGrpcClients();

app.get('/api/products', (req, res) => {
  if (inProcess) {
    return res.json(listProducts());
  }

  grpcClients!.productClient.listProducts({}, (err: any, response: any) => {
    if (err) {
      console.error('gRPC Error:', err);
      return res.status(500).json({ error: 'Failed to fetch products via gRPC' });
    }
    res.json(response.products);
  });
});

app.post('/api/order', (req, res) => {
  const { productId, quantity } = req.body ?? {};
  const parsedQuantity = Number(quantity);

  console.log(`Gateway: Received order request for product ${productId}`);

  if (!productId || !Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
    return res.status(400).json({ error: 'productId and a positive quantity are required' });
  }

  if (inProcess) {
    try {
      return res.json(createOrder(String(productId), parsedQuantity));
    } catch (err) {
      if (err instanceof ProductNotFoundError) {
        return res.status(404).json({ error: err.message });
      }
      console.error('Order Error:', err);
      return res.status(500).json({ error: 'Failed to create order' });
    }
  }

  grpcClients!.orderClient.createOrder(
    { product_id: productId, quantity: parsedQuantity },
    (err: any, response: any) => {
      if (err) {
        console.error('gRPC Error:', err);
        return res.status(500).json({ error: 'Failed to create order via gRPC' });
      }
      res.json(response);
    }
  );
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

if (!process.env.VERCEL) {
  app.listen(port, () => {
    const mode = inProcess ? 'in-process services' : 'gRPC microservices';
    console.log(`UI Gateway (BFF) running at http://localhost:${port} (${mode})`);
  });
}

export default app;
