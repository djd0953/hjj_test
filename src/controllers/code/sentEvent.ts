import express, { type Request, type Response } from 'express';

class ReturnSentEvent 
{
    clients = new Map();

    addClient = ({ userId, req, res }: {userId: number, req: Request, res: Response}) => 
    {
        if (!this.clients.has(userId)) this.clients.set(userId, []);

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        this.clients.get(userId).push(res);

        const KeepAlive = setInterval(() => 
        {
            res.write(':\n\n');
        }, 15000);

        req.on('close', () => 
        {
            clearInterval(KeepAlive);
            this.removeClient(userId, res);
        });
    };

    sendToClients = (userId: number, data: any) => 
    {
        const clientList = this.clients.get(userId) || [];
        const content = isJSONStringifiable(data) ? JSON.stringify(data) : `${data}`;
        clientList.forEach((res: Response) => 
        {
            try 
            {
                res.write(`data: ${content}\n\n`);
            }
            catch (e: any) 
            {
                console.warn(e.message);
                this.removeClient(userId, res);
            }
        });
    };

    removeClient = (userId: number, res: Response) => 
    {
        const list = this.clients.get(userId) || [];
        const filtered = list.filter((r:Response) => r !== res);
        if (filtered.length === 0) 
        {
            this.clients.delete(userId);
        } 
        else 
            this.clients.set(userId, filtered);
    };
}

const isJSONStringifiable = (obj: any) => 
{
    try 
    {
        JSON.stringify(obj);
        return true; // No error means it's JSON.stringify-able
    }
    catch (e) 
    {
        return false; // An error means it isn't
    }
};

export default async (req: Request, res: Response) => 
{
    const userId = 100;
    const returnSentEvent = new ReturnSentEvent();

    returnSentEvent.addClient({ userId, req, res });

    let i = 1;
    const intervalId = setInterval(() => 
    {
        if (i < 10) returnSentEvent.sendToClients(userId, { percent: i * 10 });
        else 
        {
            clearInterval(intervalId);
            returnSentEvent.sendToClients(userId, { percent: 100, done: true });
            returnSentEvent.removeClient(userId, res);
            res.end();
        }
        i++;
    }, 100);
};