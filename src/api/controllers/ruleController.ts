import { Request, Response } from "express";

export class RuleController {
  search(req: Request, res: Response) {
    const query = req.body.query || req.query.query;
    res.status(200).json({
      query,
      results: [
        { id: "R001", title: "Security Baseline", score: 5 }
      ]
    });
  }
}
