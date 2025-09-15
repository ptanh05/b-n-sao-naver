import { Request, Response } from 'express';
import * as service from './service';

export const getSessions = async (req: Request, res: Response) => {
  const data = await service.getSessions();
  res.json(data);
};

export const getSession = async (req: Request, res: Response) => {
  const data = await service.getSession(req.params.id);
  res.json(data);
};

export const createSession = async (req: Request, res: Response) => {
  const data = await service.createSession(req.body);
  res.status(201).json(data);
};

export const updateSession = async (req: Request, res: Response) => {
  const data = await service.updateSession(req.params.id, req.body);
  res.json(data);
};

export const deleteSession = async (req: Request, res: Response) => {
  await service.deleteSession(req.params.id);
  res.status(204).send();
};
