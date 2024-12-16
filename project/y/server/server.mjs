import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { connectDB } from './db.mjs';
import routes from './routes.mjs';

const app = express();
const port = 3005;

app.use(helmet());

const corsOptions = {
    origin: `http://localhost:3000`,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, 
  };
  
  app.use(cors(corsOptions));

app.use(express.json());

connectDB();

// Set up routes
app.use(routes);

// Start the server
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});




export default server;


