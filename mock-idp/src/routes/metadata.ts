import type { Request, Response } from 'express'
import { buildIdpMetadataXml } from '../idp'

export function metadataHandler(_req: Request, res: Response): void {
  res.setHeader('Content-Type', 'application/samlmetadata+xml; charset=utf-8')
  res.send(buildIdpMetadataXml())
}
