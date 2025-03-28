import { Request, Response } from 'express';
import { Project } from '../models';

export class ProjectController {
  // List all projects
  async getAllProjects(req: Request, res: Response) {
    try {
      const projects = await (Project as any).findAll({
        include: ['tasks']
      });
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // Create a new project
  async createProject(req: Request, res: Response) {
    try {
      const project = await (Project as any).create(req.body);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  // Get a specific project
  async getProjectById(req: Request, res: Response) {
    try {
      const project = await (Project as any).findByPk(req.params.id, {
        include: ['tasks']
      });
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // Update a project
  async updateProject(req: Request, res: Response) {
    try {
      const project = await (Project as any).findByPk(req.params.id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      await project.update(req.body);
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  // Delete a project
  async deleteProject(req: Request, res: Response) {
    try {
      const project = await (Project as any).findByPk(req.params.id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      await project.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
} 