import { Request, Response } from 'express';
import * as service from './service';

export const getTasks = async (req: Request, res: Response) => {
  const data = await service.getTasks();
  res.json(data);
};

export const getTask = async (req: Request, res: Response) => {
  const data = await service.getTask(req.params.id);
  res.json(data);
};

export const createTask = async (req: Request, res: Response) => {
  const data = await service.createTask(req.body);
  res.status(201).json(data);
};

export const updateTask = async (req: Request, res: Response) => {
  const data = await service.updateTask(req.params.id, req.body);
  res.json(data);
};

export const deleteTask = async (req: Request, res: Response) => {
  await service.deleteTask(req.params.id);
  res.status(204).send();
};
