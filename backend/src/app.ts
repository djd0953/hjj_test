'use strict';

import * as dotenv from 'dotenv';
import { json, urlencoded } from 'body-parser';
import cors from 'cors';
import express from 'express';

dotenv.config();
import { logger } from '@util';

import controllers from './controllers';


const app = express();
app.disable("x-powered-by");
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(cors({ origin: "*" }));

const PORT = process.env.PORT;

controllers(app);

app.listen(PORT, () => logger.verbose("start"));
