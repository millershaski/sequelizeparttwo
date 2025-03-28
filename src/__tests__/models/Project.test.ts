import { Sequelize } from 'sequelize';
import { Task } from '../../models/Task';
import { User } from '../../models/User';
import { Project } from '../../models/Project';
import { Tag } from '../../models/Tag';

describe('Project Model', () => {
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

    createdUser_ = await User.create(validUserData); // we must create a user for our project to use
    validProjectData.userId = createdUser_.id;
  });

  
  const validProjectData = {
    name: "Project",
    status: "active",
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000),
    userId: 0 // will be replaced in beforeEach
  };

  const validUserData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'pAssword123!',
    firstName: 'Test',
    lastName: 'User'
  };

  let createdUser_ : User;

  describe("Instance Methods", () => 
  {
    it('should calculate task completion rate', async () => 
    {
        try
        {
            const project = await Project.create(validProjectData);
            // New user should have 0% completion rate initially
            const initialCompletionRate = await project.getProgress();
            expect(initialCompletionRate).toBe('0%');

            const otherProjectData = {...validProjectData, name: "Other"};
            const otherProject = await Project.create(otherProjectData);
                    
            // Create some tasks for the project
            await Task.bulkCreate([
              {
                title: 'Completed Task',
                description: 'This is a completed task',
                status: 'completed',
                dueDate: new Date(Date.now() + 86400000),
                priority: 'medium',
                userId: createdUser_.id,
                projectId: project.id
              },
              {
                title: 'Pending Task',
                description: 'This is a pending task',
                status: 'pending',
                dueDate: new Date(Date.now() + 86400000),
                priority: 'medium',
                userId: createdUser_.id,
                projectId: project.id
              },
              {
                title: 'Unrelated task',
                description: 'This is a pending task',
                status: 'pending',
                dueDate: new Date(Date.now() + 86400000),
                priority: 'medium',
                userId: createdUser_.id,
                projectId: otherProject.id // assigned to other project. It should not be included in our percentage
              }
            ], { validate: false }); // Skip validation for testing
            
            // With 1 out of 2 tasks completed, should be 50%
            const completionRate = await project.getProgress();
            expect(completionRate).toBe('50%'); 
        } 
        catch(error: any)
        {
            console.log("Error: " + error);
            throw(error); // ensure tests still fail
        }        
      });
  });
});
