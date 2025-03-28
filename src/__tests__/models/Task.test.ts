/**
 * Task Model Tests
 * 
 * This file contains test cases for the Task model.
 * It demonstrates:
 * 1. Model instance creation
 * 2. Attribute validation
 * 3. Instance methods
 * 4. Database operations
 * 5. Model associations
 */


import { Sequelize } from 'sequelize';
import { Task } from '../../models/Task';
import { User } from '../../models/User';
import { Project } from '../../models/Project';
import { Tag } from '../../models/Tag';

describe('Task Model', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    // Create an in-memory database for testing
    sequelize = new Sequelize('sqlite::memory:', {
      logging: false
    });

    // Initialize models with the test database
    User.init(
      User.getAttributes(),
      { ...User.options, sequelize }
    );
    
    Project.init(
      Project.getAttributes(),
      { ...Project.options, sequelize }
    );
    
    Tag.init(
      Tag.getAttributes(), 
      { ...Tag.options, sequelize }
    );
    
    Task.init(
      Task.getAttributes(),
      { ...Task.options, sequelize }
    );

    // Set up associations
    User.hasMany(Task, { as: 'tasks', foreignKey: 'userId' });
    Task.belongsTo(User, { foreignKey: 'userId' });
    
    Project.hasMany(Task, { as: 'tasks', foreignKey: 'projectId' });
    Task.belongsTo(Project, { foreignKey: 'projectId' });
    
    Task.belongsToMany(Tag, { through: 'TaskTags', as: 'tags' });
    Tag.belongsToMany(Task, { through: 'TaskTags', as: 'tasks' });

    // Sync all models
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clear all tables before each test
    await Task.destroy({ where: {} });
    await Tag.destroy({ where: {} });
    await Project.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  // Test data
  const mockUser = {
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'pAssword123!'
  };

  const mockProject = {
    name: 'Test Project',
    status: 'active' as const,
    description: 'Test project description',
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000)
  };

  const createTestData = async () => {
    const user = await User.create(mockUser);
    const project = await Project.create({
      ...mockProject,
      userId: user.id
    });
    
    return { user, project };
  };

  describe('Model Creation', () => {
    it('should create a valid task instance', async () => {
      const { user, project } = await createTestData();
      
      const taskData = {
        title: 'Test Task',
        description: 'This is a test task',
        status: 'pending' as const,
        dueDate: new Date(Date.now() + 86400000), // Tomorrow
        priority: 'medium' as const,
        userId: user.id,
        projectId: project.id
      };
      
      const task = await Task.create(taskData);
      
      expect(task).toBeDefined();
      expect(task.id).toBeDefined();
      expect(task.title).toBe(taskData.title);
      expect(task.description).toBe(taskData.description);
      expect(task.status).toBe(taskData.status);
      expect(task.dueDate).toEqual(taskData.dueDate);
      expect(task.priority).toBe(taskData.priority);
      expect(task.userId).toBe(taskData.userId);
      expect(task.projectId).toBe(taskData.projectId);
      expect(task.createdAt).toBeDefined();
      expect(task.updatedAt).toBeDefined();
    });
  });

  describe('Validation', () => {
    it('should validate required fields', async () => {
      await expect(Task.create({} as any)).rejects.toThrow(); // this is a poor test, as it will pass if only 1 field can't be null (tests should be explicit)
    });

    it('should validate title length', async () => {
      const { user, project } = await createTestData();
      
      const baseTaskData = {
        description: 'This is a test task',
        status: 'pending' as const,
        dueDate: new Date(Date.now() + 86400000),
        priority: 'medium' as const,
        userId: user.id,
        projectId: project.id
      };
      
      // Test short title
      const shortTitle = { ...baseTaskData, title: 'ab' };
      await expect(Task.create(shortTitle)).rejects.toThrow("Validation error: Validation len on title failed");
      
      // Test long title
      const longTitle = { ...baseTaskData, title: 'a'.repeat(101) };
      await expect(Task.create(longTitle)).rejects.toThrow("Validation error: Validation len on title failed");
    });

    it('should validate status values', async () => {
      const { user, project } = await createTestData();
      
      const taskData = {
        title: 'Test Task',
        description: 'This is a test task',
        status: 'invalid_status' as any,
        dueDate: new Date(Date.now() + 86400000),
        priority: 'medium' as const,
        userId: user.id,
        projectId: project.id
      };
      
      await expect(Task.create(taskData)).rejects.toThrow("Validation error: Status had unexpected value. Look to TaskStatus for correct values");
    });

    it('should validate priority values', async () => {
      const { user, project } = await createTestData();
      
      const taskData = {
        title: 'Test Task',
        description: 'This is a test task',
        status: 'pending' as const,
        dueDate: new Date(Date.now() + 86400000),
        priority: 'invalid_priority' as any,
        userId: user.id,
        projectId: project.id
      };
      
      await expect(Task.create(taskData)).rejects.toThrow("Validation error: Priority had unexpected value. Look to TaskPriority for correct values");
    });

    it('should validate due date is in the future', async () => {
      const { user, project } = await createTestData();
      
      const taskData = {
        title: 'Test Task',
        description: 'This is a test task',
        status: 'pending' as const,
        dueDate: new Date(Date.now() - 86400000), // Yesterday
        priority: 'medium' as const,
        userId: user.id,
        projectId: project.id
      };
      
      await expect(Task.create(taskData)).rejects.toThrow('Due date must be in the future');
    });
  });

  describe('Instance Methods', () => {
    it('should correctly identify overdue tasks', async () => {
      const { user, project } = await createTestData();
      
      // Create a task with future due date
      const futureTask = await Task.create({
        title: 'Future Task',
        description: 'This is a test task',
        status: 'pending' as const,
        dueDate: new Date(Date.now() + 86400000), // Tomorrow
        priority: 'medium' as const,
        userId: user.id,
        projectId: project.id
      });
      
      expect(futureTask.isOverdue()).toBe(false);
      
      // Create a task with past due date by bypassing validation
      const pastDueTask = Task.build({
        title: 'Overdue Task',
        description: 'This is an overdue task',
        status: 'pending' as const,
        dueDate: new Date(Date.now() - 86400000), // Yesterday
        priority: 'high' as const,
        userId: user.id,
        projectId: project.id
      } as any); // Cast to any to bypass TypeScript validation
      
      // Save without validation
      await pastDueTask.save({ validate: false });
      
      expect(pastDueTask.isOverdue()).toBe(true);
      
      // Mark as completed
      await pastDueTask.update({ status: 'completed' });
      expect(pastDueTask.isOverdue()).toBe(false);
    });

    it('should calculate progress correctly', async () => {
      const { user, project } = await createTestData();
      
      // Base task data
      const baseTaskData = {
        title: 'Progress Test Task',
        description: 'Testing progress calculation',
        dueDate: new Date(Date.now() + 86400000),
        priority: 'medium' as const,
        userId: user.id,
        projectId: project.id
      };
      
      // Create a pending task
      const pendingTask = await Task.create({
        ...baseTaskData,
        status: 'pending' as const
      });
      expect(pendingTask.getProgress()).toBe('0%');
      
      // Create an in-progress task
      const inProgressTask = await Task.create({
        ...baseTaskData,
        status: 'in_progress' as const
      });
      expect(inProgressTask.getProgress()).toBe('50%');
      
      // Create a completed task
      const completedTask = await Task.create({
        ...baseTaskData,
        status: 'completed' as const
      });
      expect(completedTask.getProgress()).toBe('100%');

      // Create a cancelled task
      const cancelledTask = await Task.create({
        ...baseTaskData,
        status: 'cancelled' as const
      });
      expect(cancelledTask.getProgress()).toBe('0%');
    });
  });

  describe('Database Operations', () => {
    it('should update task information', async () => {
      const { user, project } = await createTestData();
      
      const task = await Task.create({
        title: 'Original Task',
        description: 'This will be updated',
        status: 'pending' as const,
        dueDate: new Date(Date.now() + 86400000),
        priority: 'medium' as const,
        userId: user.id,
        projectId: project.id
      });
      
      const updateData = { 
        title: 'Updated Task', 
        priority: 'high' as const 
      };
      
      await task.update(updateData);
      expect(task.title).toBe(updateData.title);
      expect(task.priority).toBe(updateData.priority);
    });

    it('should delete task', async () => {
      const { user, project } = await createTestData();
      
      const task = await Task.create({
        title: 'Task to Delete',
        description: 'This will be deleted',
        status: 'pending' as const,
        dueDate: new Date(Date.now() + 86400000),
        priority: 'medium' as const,
        userId: user.id,
        projectId: project.id
      });
      
      const taskId = task.id;
      await task.destroy();
      
      const deletedTask = await Task.findByPk(taskId);
      expect(deletedTask).toBeNull();
    });
  });

  describe('Associations', () => {
    it('should belong to a user', async () => {
      const { user, project } = await createTestData();
      
      const task = await Task.create({
        title: 'User Association Task',
        description: 'Testing user association',
        status: 'pending' as const,
        dueDate: new Date(Date.now() + 86400000),
        priority: 'medium' as const,
        userId: user.id,
        projectId: project.id
      });
      
      const taskUser = await task.getUser();
      expect(taskUser).toBeDefined();
      expect(taskUser.id).toBe(user.id);
      expect(taskUser.username).toBe(user.username);
    });

    it('should belong to a project', async () => {
      const { user, project } = await createTestData();
      
      const task = await Task.create({
        title: 'Project Association Task',
        description: 'Testing project association',
        status: 'pending' as const,
        dueDate: new Date(Date.now() + 86400000),
        priority: 'medium' as const,
        userId: user.id,
        projectId: project.id
      });
      
      const taskProject = await task.getProject();
      expect(taskProject).toBeDefined();
      expect(taskProject.id).toBe(project.id);
      expect(taskProject.name).toBe(project.name);
    });

    it('should have many tags', async () => {
      const { user, project } = await createTestData();
      
      // Create task
      const task = await Task.create({
        title: 'Tag Association Task',
        description: 'Testing tag association',
        status: 'pending' as const,
        dueDate: new Date(Date.now() + 86400000),
        priority: 'medium' as const,
        userId: user.id,
        projectId: project.id
      });
      
      // Create tags
      const tags = await Tag.bulkCreate([
        { name: 'Urgent', color: '#ff0000' },
        { name: 'Important', color: '#00ff00' }
      ]);
      
      // Test initial association
      const initialTags = await task.getTags();
      expect(initialTags).toBeDefined();
      expect(Array.isArray(initialTags)).toBe(true);
      expect(initialTags.length).toBe(0);
      
      // Add tags
      await task.addTags(tags);
      
      // Check tags were added
      const addedTags = await task.getTags();
      expect(addedTags.length).toBe(tags.length);
      
      // Remove tags
      await task.removeTags(tags);
      
      // Check tags were removed
      const finalTags = await task.getTags();
      expect(finalTags.length).toBe(0);
    });
  });

  describe('Querying', () => {
    it('should find tasks by status', async () => {
      const { user, project } = await createTestData();
      
      // Create tasks with different statuses
      await Task.create({
        title: 'Pending Task',
        description: 'This is a pending task',
        status: 'pending' as const,
        dueDate: new Date(Date.now() + 86400000),
        priority: 'medium' as const,
        userId: user.id,
        projectId: project.id
      });
      
      await Task.create({
        title: 'In Progress Task',
        description: 'This is an in progress task',
        status: 'in_progress' as const,
        dueDate: new Date(Date.now() + 86400000),
        priority: 'medium' as const,
        userId: user.id,
        projectId: project.id
      });
      
      // Find pending tasks
      const pendingTasks = await Task.findAll({ where: { status: 'pending' } });
      expect(pendingTasks.length).toBe(1);
      expect(pendingTasks[0].status).toBe('pending');
      
      // Find in progress tasks
      const inProgressTasks = await Task.findAll({ where: { status: 'in_progress' } });
      expect(inProgressTasks.length).toBe(1);
      expect(inProgressTasks[0].status).toBe('in_progress');
    });
  });
}); 