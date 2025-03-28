/**
 * Task Routes
 * 
 * This file contains all routes related to task management.
 * It demonstrates:
 * 1. Express router setup
 * 2. CRUD operations for tasks
 * 3. Error handling
 * 4. TypeScript type safety
 */

import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';

const router = Router();
const taskController = new TaskController();

// List all tasks
router.get('/', taskController.getAllTasks.bind(taskController));

// Create a new task
router.post('/', taskController.createTask.bind(taskController));

// Get a specific task
router.get('/:id', taskController.getTaskById.bind(taskController));

// Update a task
router.put('/:id', taskController.updateTask.bind(taskController));

// Delete a task
router.delete('/:id', taskController.deleteTask.bind(taskController));

export default router; 