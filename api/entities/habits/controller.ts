import { Request, Response } from 'express';
import * as service from './service';

export const getHabits = async (req: Request, res: Response) => {
  const data = await service.getHabits();
  res.json(data);
};

export const getHabit = async (req: Request, res: Response) => {
  const data = await service.getHabit(req.params.id);
  res.json(data);
};

export const createHabit = async (req: Request, res: Response) => {
  const data = await service.createHabit(req.body);
  res.status(201).json(data);
};

export const updateHabit = async (req: Request, res: Response) => {
  const data = await service.updateHabit(req.params.id, req.body);
  res.json(data);
};

export const deleteHabit = async (req: Request, res: Response) => {
  await service.deleteHabit(req.params.id);
  res.status(204).send();
};
