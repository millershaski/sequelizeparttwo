import { Request, Response } from 'express';
import { Tag } from '../models';

export class TagController {
  // List all tags
  async getAllTags(req: Request, res: Response) {
    try {
      const tags = await (Tag as any).findAll({
        include: ['tasks']
      });
      res.json(tags);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // Create a new tag
  async createTag(req: Request, res: Response) {
    try {
      const tag = await (Tag as any).create(req.body);
      res.status(201).json(tag);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  // Get a specific tag
  async getTagById(req: Request, res: Response) {
    try {
      const tag = await (Tag as any).findByPk(req.params.id, {
        include: ['tasks']
      });
      if (!tag) {
        return res.status(404).json({ error: 'Tag not found' });
      }
      res.json(tag);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // Update a tag
  async updateTag(req: Request, res: Response) {
    try {
      const tag = await (Tag as any).findByPk(req.params.id);
      if (!tag) {
        return res.status(404).json({ error: 'Tag not found' });
      }
      await tag.update(req.body);
      res.json(tag);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  // Delete a tag
  async deleteTag(req: Request, res: Response) {
    try {
      const tag = await (Tag as any).findByPk(req.params.id);
      if (!tag) {
        return res.status(404).json({ error: 'Tag not found' });
      }
      await tag.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
} 