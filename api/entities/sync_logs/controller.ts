import { Request, Response } from 'express';
import * as service from './service';

export const getLogs = async (req: Request, res: Response) => {
  const data = await service.getLogs();
  res.json(data);
};

export const getLog = async (req: Request, res: Response) => {
  const data = await service.getLog(req.params.id);
  res.json(data);
};

export const createLog = async (req: Request, res: Response) => {
  const data = await service.createLog(req.body);
  res.status(201).json(data);
};

export const updateLog = async (req: Request, res: Response) => {
  const data = await service.updateLog(req.params.id, req.body);
  res.json(data);
};

export const deleteLog = async (req: Request, res: Response) => {
  await service.deleteLog(req.params.id);
  res.status(204).send();
};
