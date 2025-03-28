/**
 * Models Index
 * 
 * This file serves as the central point for all database models.
 * It:
 * 1. Imports all models
 * 2. Sets up model associations
 * 3. Exports all models for use in the application
 */

import { User } from './User';
import { Task } from './Task';
import { Project } from './Project';
import { Tag } from './Tag';
import sequelize from '../config/database';

// Set up basic associations between models
User.hasMany(Task, { 
  as: 'tasks',
  foreignKey: 'userId',
  onDelete: 'CASCADE', // When a user is deleted, delete all their tasks
});

Task.belongsTo(User, { 
  as: 'user',
  foreignKey: 'userId',
});

Project.hasMany(Task, { 
  as: 'tasks',
  foreignKey: 'projectId',
  onDelete: 'CASCADE', // When a project is deleted, delete all its tasks
});

Task.belongsTo(Project, { 
  as: 'project',
  foreignKey: 'projectId',
});

Task.belongsToMany(Tag, { 
  through: 'TaskTags',
  as: 'tags',
  foreignKey: 'taskId',
});

Tag.belongsToMany(Task, { 
  through: 'TaskTags',
  as: 'tasks',
  foreignKey: 'tagId',
});


// This hook will be called whenever any model is created
sequelize.addHook('afterCreate', (instance, options) => {
  console.log("Record created: " + JSON.stringify(instance, null, 2));
});

// This hook will be called whenever any model is updated
sequelize.addHook('afterUpdate', (instance, options) => {
  
  console.log("Record updated: " + JSON.stringify(instance, null, 2));
});

// This hook will be called whenever any model is deleted
sequelize.addHook('afterDestroy', (instance, options) => {  
  console.log("Record deleted: " + JSON.stringify(instance, null, 2));
});


// Export all models
export { User, Task, Project, Tag, sequelize }; 