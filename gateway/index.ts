import express from 'express';
import cors from 'cors';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Load Order Proto for gRPC client
const ORDER_PROTO_PATH = path.join(__dirname, '../proto/order.proto');
const packageDefinition = protoLoader.loadSync(ORDER_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const orderProto: any = grpc.loadPackageDefinition(packageDefinition).order;

// Order Service Client
const orderClient = new orderProto.OrderService(
  'localhost:50052',
  grpc.credentials.createInsecure()
);

// REST API for Frontend
app.post('/api/order', (req, res) => {
  const { productId, quantity } = req.body;

  console.log(`Gateway: Received order request for product ${productId}`);

  orderClient.createOrder({ product_id: productId, quantity }, (err: any, response: any) => {
    if (err) {
      console.error('gRPC Error:', err);
      return res.status(500).json({ error: 'Failed to create order via gRPC' });
    }
    res.json(response);
  });
});

app.listen(port, () => {
  console.log(`UI Gateway (BFF) running at http://localhost:${port}`);
});
