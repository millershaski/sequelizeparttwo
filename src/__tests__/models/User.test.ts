/**
 * User Model Tests
 * 
 * This file contains test cases for the User model.
 * It demonstrates:
 * 1. Model instance creation
 * 2. Attribute validation
 * 3. Instance methods
 * 4. Model hooks
 * 5. Database operations
 */

import { Sequelize } from 'sequelize';
import { User } from '../../models/User';
import { Task } from '../../models/Task';
import { Project } from '../../models/Project';
import { Tag } from '../../models/Tag';

describe('User Model', () => {
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
    
    Task.init(
      Task.getAttributes(),
      { ...Task.options, sequelize }
    );
    
    Tag.init(
      Tag.getAttributes(), 
      { ...Tag.options, sequelize }
    );

    // Set up associations
    User.hasMany(Task, { as: 'tasks', foreignKey: 'userId' });
    Task.belongsTo(User, { foreignKey: 'userId' });
    
    User.hasMany(Project, { as: 'projects', foreignKey: 'userId' });
    Project.belongsTo(User, { foreignKey: 'userId' });
    
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
  const validUserData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'pAssword123!',
    firstName: 'Test',
    lastName: 'User'
  };

  describe('Model Creation', () => {
    it('should create a valid user instance', async () => {
      const user = await User.create(validUserData);
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.username).toBe(validUserData.username);
      expect(user.email).toBe(validUserData.email);
      expect(user.firstName).toBe(validUserData.firstName);
      expect(user.lastName).toBe(validUserData.lastName);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });
  });

  describe('Validation', () => {
    it('should validate required fields', async () => {

      // I'm assuming that "validate required fields" means to assert that no fields with allowNull set to false can be provided a null value
      const allNullData = {...validUserData, username: null, email: null, password: null, firstName: null, lastName: null, id: null};
      await expect(User.create(allNullData)).rejects.toThrow();

      const nonNullData = {...validUserData, username: "bobUnique", email: "bobUnique@bob.com", password: "12345679a!B", firstName: "Bob", lastName: "Smith", id: null}; // note that ID is explicitly made null
      await expect(User.create(nonNullData)).resolves.not.toThrow();      

      const nullUserName = {...validUserData, username: null};
      await expect(User.create(nullUserName)).rejects.toThrow("User.username cannot be null");   

      const nullEmail = {...validUserData, email: null};
      await expect(User.create(nullEmail)).rejects.toThrow("User.email cannot be null");   
      
      const nullPassword = {...validUserData, password: null};
      await expect(User.create(nullPassword)).rejects.toThrow("User.password cannot be null");   
      
      const nullFirstName = {...validUserData, firstName: null};
      await expect(User.create(nullFirstName)).rejects.toThrow("User.firstName cannot be null");   
      
      const nullLastName = {...validUserData, lastName: null};
      await expect(User.create(nullLastName)).rejects.toThrow("User.lastName cannot be null");  
    });


    it('should validate username length', async () => { 

      const shortUserName = { ...validUserData, username: "aa" };
      await expect(User.create(shortUserName)).rejects.toThrow("Validation error: Validation len on username failed");
            
      const exactCorrectShortUserName = { ...validUserData, username: "abc" }; // 3 characters should pass
      await expect(User.create(exactCorrectShortUserName)).resolves.not.toThrow();      

      const exactCorrectLongUserName = { ...validUserData, email: "unique3@gmail.com", username: "aaaaabcaaaaaaaaaaaaaaaaaaaaaaa" }; // 30 characters should pass
      await expect(User.create(exactCorrectLongUserName)).resolves.not.toThrow();      

      const longUserName = { ...validUserData, username: "aaaaaaaaaaaaaaaaaaaaaaaaadcaaaa" }; // 31 should fail
      await expect(User.create(longUserName)).rejects.toThrow("Validation error: Validation len on username failed");        
    });

    it('should validate email format', async () => {
      
      const noAt = {...validUserData, email:"bob.com"};
      await expect(User.create(noAt)).rejects.toThrow("Email is not in a valid format");

      const noDot = {...validUserData, email:"bob@com"};
      await expect(User.create(noDot)).rejects.toThrow("Email is not in a valid format");
      
      const valid = {...validUserData, email:"bob@bob.com"};
      await expect(User.create(valid)).resolves.not.toThrow();
    });

    it('should validate password length', async () => {

      await expect("").rejects
      const shortPassword = { ...validUserData, password: '12A!5' };
      await expect(User.create(shortPassword))
        .rejects
        .toThrow("Validation error: Validation len on password failed");

      const longPassword = { ...validUserData, password: 'A1!'.repeat(101) };
      await expect(User.create(longPassword))
        .rejects
        .toThrow("Validation error: Validation len on password failed");
    });

    it('should validate name lengths', async () => {
      const shortFirstName = { ...validUserData, firstName: 'a' };
      await expect(User.create(shortFirstName))
        .rejects
        .toThrow("Validation error: Validation len on firstName failed");

      const longFirstName = { ...validUserData, firstName: 'a'.repeat(51) };
      await expect(User.create(longFirstName))
        .rejects
        .toThrow("Validation error: Validation len on firstName failed");
    });

    it('should validate name nonnumber', async () => {
      const badFirstName = { ...validUserData, firstName: 'appleJohn1' };
      await expect(User.create(badFirstName)).rejects.toThrow();

      const badLastName = { ...validUserData, lastName: 'appleJohn1' };
      await expect(User.create(badLastName)).rejects.toThrow();
    });
  });

  describe('Instance Methods', () => {
    it('should return full name correctly', async () => {

       const data = {...validUserData, firstName: "bob", lastName: "smith"};
       const user = await User.create(data);
       expect(user.getFullName()).toBe("bob smith");
    });

    it('should calculate task completion rate', async () => {
      const user = await User.create(validUserData);
      
      // New user should have 0% completion rate initially
      const initialCompletionRate = await user.getTaskCompletionRate();
      expect(initialCompletionRate).toBe('0%');
      
      // Create a project for the tasks
      const project = await Project.create({
        name: 'Test Project',
        description: 'A test project',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        userId: user.id
      }, { validate: false });
      
      // Create some tasks for the user
      await Task.bulkCreate([
        {
          title: 'Completed Task',
          description: 'This is a completed task',
          status: 'completed',
          dueDate: new Date(Date.now() + 86400000),
          priority: 'medium',
          userId: user.id,
          projectId: project.id
        },
        {
          title: 'Pending Task',
          description: 'This is a pending task',
          status: 'pending',
          dueDate: new Date(Date.now() + 86400000),
          priority: 'medium',
          userId: user.id,
          projectId: project.id
        }
      ], { validate: false }); // Skip validation for testing
      
      // With 1 out of 2 tasks completed, should be 50%
      const completionRate = await user.getTaskCompletionRate();
      expect(completionRate).toBe('50%');
    });

    it('should count active projects', async () => {
      const user = await User.create(validUserData);
      
      // New user should have 0 active projects initially
      const initialCount = await user.getActiveProjectsCount();
      expect(initialCount).toBe(0);
      
      // Create projects for the user
      await Project.bulkCreate([
        {
          name: 'Active Project',
          description: 'This is an active project',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000),
          userId: user.id
        },
        {
          name: 'Completed Project',
          description: 'This is a completed project',
          status: 'completed',
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000),
          userId: user.id
        }
      ], { validate: false }); // Skip validation for testing
      
      // Should have 1 active project
      const activeCount = await user.getActiveProjectsCount();
      expect(activeCount).toBe(1);
    });
  });

  describe('Database Operations', () => {
    it('should update user information', async () => {
      const user = await User.create(validUserData);
      const updateData = { firstName: 'Updated', lastName: 'Name' };
      
      await user.update(updateData);
      expect(user.firstName).toBe(updateData.firstName);
      expect(user.lastName).toBe(updateData.lastName);
    });

    it('should delete user', async () => {
      const user = await User.create(validUserData);
      const userId = user.id;
      
      await user.destroy();
      const deletedUser = await User.findByPk(userId);
      expect(deletedUser).toBeNull();
    });
  });

  describe('Unique Constraints', () => {
    it('should enforce unique username', async () => {
      await User.create(validUserData);
      
      // Try to create another user with the same username
      const duplicateUser = { 
        ...validUserData, 
        email: 'different@example.com' // Different email
      };
      
      await expect(User.create(duplicateUser))
        .rejects
        .toThrow();
    });

    it('should enforce unique email', async () => {
      await User.create(validUserData);
      
      // Try to create another user with the same email
      const duplicateUser = { 
        ...validUserData, 
        username: 'differentuser' // Different username
      };
      
      await expect(User.create(duplicateUser))
        .rejects
        .toThrow();
    });
  });

  describe('Associations', () => {
    it('should have many tasks', async () => {
      const user = await User.create(validUserData);
      
      // Create a project for the user
      const project = await Project.create({
        name: 'Test Project',
        description: 'A test project',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        userId: user.id
      }, { validate: false });
      
      // Create tasks for the user
      await Task.bulkCreate([
        {
          title: 'Task 1',
          description: 'This is task 1',
          status: 'pending',
          dueDate: new Date(Date.now() + 86400000),
          priority: 'medium',
          userId: user.id,
          projectId: project.id
        },
        {
          title: 'Task 2',
          description: 'This is task 2',
          status: 'in_progress',
          dueDate: new Date(Date.now() + 86400000),
          priority: 'high',
          userId: user.id,
          projectId: project.id
        }
      ], { validate: false });
      
      // Get tasks and verify
      const tasks = await user.getTasks();
      expect(tasks).toBeDefined();
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBe(2);
    });

    it('should have many projects', async () => {
      const user = await User.create(validUserData);
      
      // Create projects for the user
      await Project.bulkCreate([
        {
          name: 'Project 1',
          description: 'This is project 1',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000),
          userId: user.id
        },
        {
          name: 'Project 2',
          description: 'This is project 2',
          status: 'on_hold',
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000),
          userId: user.id
        }
      ], { validate: false });
      
      // Get projects and verify
      const projects = await user.getProjects();
      expect(projects).toBeDefined();
      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBe(2);
    });
  });
}); 