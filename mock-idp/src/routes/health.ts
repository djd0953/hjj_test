import type { Request, Response } from 'express'
import { config } from '../config'

export function healthHandler(_req: Request, res: Response): void {
  res.json({
    status: 'ok',
    idpEntityId: config.idpEntityId,
    baseUrl: config.baseUrl,
    spEntityId: config.spEntityId,
  })
}
