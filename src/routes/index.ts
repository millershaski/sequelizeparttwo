/**
 * Routes Index
 * 
 * This file serves as the central point for all API routes.
 * It demonstrates:
 * 1. Route module organization
 * 2. Express router setup
 * 3. Route prefixing
 * 4. API versioning
 */

import { Router } from 'express';
import taskRoutes from './taskRoutes';
import userRoutes from './userRoutes';
import projectRoutes from './projectRoutes';
import tagRoutes from './tagRoutes';

const router = Router();

// Mount routes with their respective prefixes
router.use(`/api/tasks`, taskRoutes);
router.use(`/api/users`, userRoutes);
router.use(`/api/projects`, projectRoutes);
router.use(`/api/tags`, tagRoutes);

export default router; 