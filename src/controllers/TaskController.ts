import { Request, Response } from 'express';
import { Task } from '../models';

export class TaskController {
  // List all tasks
  async getAllTasks(req: Request, res: Response) {
    try {
      const tasks = await (Task as any).findAll({
        include: ['user', 'project', 'tags']
      });
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // Create a new task
  async createTask(req: Request, res: Response) {
    try {
      const task = await (Task as any).create(req.body);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  // Get a specific task
  async getTaskById(req: Request, res: Response) {
    try {
      const task = await (Task as any).findByPk(req.params.id, {
        include: ['user', 'project', 'tags']
      });
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // Update a task
  async updateTask(req: Request, res: Response) {
    try {
      const task = await (Task as any).findByPk(req.params.id);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      await task.update(req.body);
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  // Delete a task
  async deleteTask(req: Request, res: Response) {
    try {
      const task = await (Task as any).findByPk(req.params.id);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      await task.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
} 