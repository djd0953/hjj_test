'use strict';

import * as dotenv from 'dotenv';
import { json, urlencoded } from 'body-parser';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';

dotenv.config();
import { logger } from '@util';

import controllers from './controllers';
import { initWebSocket } from './ws';


const app = express();
app.disable("x-powered-by");
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(cors({ origin: "*" }));

const PORT = process.env.PORT;

controllers(app);

const server = createServer(app);
initWebSocket(server);

server.listen(PORT, () => logger.verbose("start"));
