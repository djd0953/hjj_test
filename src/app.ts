'use strict';

import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { json, urlencoded } from 'body-parser';
import cors from 'cors';

import controllers from './controllers';

const app = express();
app.disable("x-powered-by");
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(cors({ origin: "*" }));

const PORT = 9090;

controllers(app);

app.listen(PORT);
