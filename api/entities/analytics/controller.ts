import { Request, Response } from 'express';
import * as service from './service';

export const getAnalytics = async (req: Request, res: Response) => {
  const data = await service.getAnalytics();
  res.json(data);
};

export const getAnalytic = async (req: Request, res: Response) => {
  const data = await service.getAnalytic(req.params.id);
  res.json(data);
};

export const createAnalytic = async (req: Request, res: Response) => {
  const data = await service.createAnalytic(req.body);
  res.status(201).json(data);
};

export const updateAnalytic = async (req: Request, res: Response) => {
  const data = await service.updateAnalytic(req.params.id, req.body);
  res.json(data);
};

export const deleteAnalytic = async (req: Request, res: Response) => {
  await service.deleteAnalytic(req.params.id);
  res.status(204).send();
};
