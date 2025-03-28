import { Request, Response } from 'express';
import { User } from '../models';

export class UserController {
  // List all users
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await (User as any).findAll({
        include: ['tasks']
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // Create a new user
  async createUser(req: Request, res: Response) {
    try {
      const user = await (User as any).create(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  // Get a specific user
  async getUserById(req: Request, res: Response) {
    try {
      const user = await (User as any).findByPk(req.params.id, {
        include: ['tasks']
      });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // Update a user
  async updateUser(req: Request, res: Response) {
    try {
      const user = await (User as any).findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      await user.update(req.body);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  // Delete a user
  async deleteUser(req: Request, res: Response) {
    try {
      const user = await (User as any).findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      await user.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
} 