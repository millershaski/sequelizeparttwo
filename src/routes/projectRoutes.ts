/**
 * Project Routes
 * 
 * This file contains all routes related to project management.
 * It demonstrates:
 * 1. Express router setup
 * 2. CRUD operations for projects
 * 3. Error handling
 * 4. TypeScript type safety
 */

import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController';

const router = Router();
const projectController = new ProjectController();

// List all projects
router.get('/', projectController.getAllProjects.bind(projectController));

// Create a new project
router.post('/', projectController.createProject.bind(projectController));

// Get a specific project
router.get('/:id', projectController.getProjectById.bind(projectController));

// Update a project
router.put('/:id', projectController.updateProject.bind(projectController));

// Delete a project
router.delete('/:id', projectController.deleteProject.bind(projectController));

export default router; 