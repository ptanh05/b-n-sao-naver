import { Request, Response } from 'express';
import * as service from './service';

export const getSchedules = async (req: Request, res: Response) => {
  const data = await service.getSchedules();
  res.json(data);
};

export const getSchedule = async (req: Request, res: Response) => {
  const data = await service.getSchedule(req.params.id);
  res.json(data);
};

export const createSchedule = async (req: Request, res: Response) => {
  const data = await service.createSchedule(req.body);
  res.status(201).json(data);
};

export const updateSchedule = async (req: Request, res: Response) => {
  const data = await service.updateSchedule(req.params.id, req.body);
  res.json(data);
};

export const deleteSchedule = async (req: Request, res: Response) => {
  await service.deleteSchedule(req.params.id);
  res.status(204).send();
};
