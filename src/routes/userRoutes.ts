/**
 * User Routes
 * 
 * This file contains all routes related to user management.
 * It demonstrates:
 * 1. Express router setup
 * 2. CRUD operations for users
 * 3. Error handling
 * 4. TypeScript type safety
 */

import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = new UserController();

// List all users
router.get('/', userController.getAllUsers.bind(userController));

// Create a new user
router.post('/', userController.createUser.bind(userController));

// Get a specific user
router.get('/:id', userController.getUserById.bind(userController));

// Update a user
router.put('/:id', userController.updateUser.bind(userController));

// Delete a user
router.delete('/:id', userController.deleteUser.bind(userController));


export default router; 