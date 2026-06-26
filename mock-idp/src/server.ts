import express from 'express';

import { config } from './config';
import { metadataHandler } from './routes/metadata';
import { ssoServiceHandler } from './routes/ssoservice';
import { loginHandler } from './routes/login';
import { healthHandler } from './routes/health';

const app = express();

app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(express.json({ limit: '2mb' }));

app.get('/health', healthHandler);
app.get('/metadata', metadataHandler);

app.get('/idp/saml/ssoservice.do', ssoServiceHandler);
app.post('/idp/saml/ssoservice.do', ssoServiceHandler);
app.post('/idp/saml/login', loginHandler);

app.get('/', (_req, res) => 
{
    res.send(
        `<h1>Mock HSAD IdP</h1>` +
      `<ul>` +
      `<li><a href="/metadata">/metadata</a></li>` +
      `<li><a href="/health">/health</a></li>` +
      `</ul>` +
      `<p>SP-initiated flow: SP 가 <code>POST /idp/saml/ssoservice.do</code> 로 SAMLRequest 전송</p>`
    );
});

app.listen(config.port, () => 
{
    console.log(`[mock-idp] listening on ${config.baseUrl} (port ${config.port})`);
    console.log(`[mock-idp] idp entityID = ${config.idpEntityId}`);
    console.log(`[mock-idp] sp  entityID = ${config.spEntityId}`);
    console.log(`[mock-idp] sp  ACS URL  = ${config.spAcsUrl}`);
    console.log(`[mock-idp] signResponse = ${config.signResponse}`);
});
