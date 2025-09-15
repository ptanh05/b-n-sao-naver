import { Request, Response } from 'express';
import * as service from './service';

export const getUsers = async (req: Request, res: Response) => {
  const data = await service.getUsers();
  res.json(data);
};

export const getUser = async (req: Request, res: Response) => {
  const data = await service.getUser(req.params.id);
  res.json(data);
};

export const createUser = async (req: Request, res: Response) => {
  const data = await service.createUser(req.body);
  res.status(201).json(data);
};

export const updateUser = async (req: Request, res: Response) => {
  const data = await service.updateUser(req.params.id, req.body);
  res.json(data);
};

export const deleteUser = async (req: Request, res: Response) => {
  await service.deleteUser(req.params.id);
  res.status(204).send();
};
