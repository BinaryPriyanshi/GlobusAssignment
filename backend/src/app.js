import express from 'express';
import cors from 'cors';


const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
}))

import pdfParserRoutes from './routes/pdfParser.routes.js';
import questionRoutes from './routes/questions.routes.js'

app.use('/api/v1',pdfParserRoutes)
app.use('/api/v1/questions',questionRoutes)


export default app;