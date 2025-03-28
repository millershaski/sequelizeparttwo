/**
 * Tag Routes
 * 
 * This file contains all routes related to tag management.
 * It demonstrates:
 * 1. Express router setup
 * 2. CRUD operations for tags
 * 3. Error handling
 * 4. TypeScript type safety
 */

import { Router } from 'express';
import { TagController } from '../controllers/TagController';

const router = Router();
const tagController = new TagController();

// List all tags
router.get('/', tagController.getAllTags.bind(tagController));

// Create a new tag
router.post('/', tagController.createTag.bind(tagController));

// Get a specific tag
router.get('/:id', tagController.getTagById.bind(tagController));

// Update a tag
router.put('/:id', tagController.updateTag.bind(tagController));

// Delete a tag
router.delete('/:id', tagController.deleteTag.bind(tagController));

export default router; 