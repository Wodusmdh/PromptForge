import { Request, Response } from "express";

export class SystemController {
  health(req: Request, res: Response) {
    res.status(200).json({ status: "up", timestamp: new Date() });
  }

  version(req: Request, res: Response) {
    res.status(200).json({ version: "2.0.0", apiVersion: "v1" });
  }
}
