import { Sequelize } from 'sequelize';
import { Task } from '../../models/Task';
import { User } from '../../models/User';
import { Project } from '../../models/Project';
import { Tag } from '../../models/Tag';

describe('Tag Model', () => {
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
  

  describe('Validate', () => 
  {
    it('should not allow invalid hex colors', async () => 
    {      
      const tagData = {
        name: "Tag Name",
        color: "#000000"
      };
      
      await expect(Tag.create(tagData)).resolves.not.toThrow(); // valid tag data, should pass
      
      const threeCode = {name: "threeCode", color: "#FA0"};      
      await expect(Tag.create(threeCode)).resolves.not.toThrow(); // valid tag data, should pass

      const noHashTag = {name: "noHash", color: "000000"};
      await expect(Tag.create(noHashTag)).rejects.toThrow();
      
      const shortColor = {name: "shortColor", color: "#00"};
      await expect(Tag.create(shortColor)).rejects.toThrow();
      
      const longColor = {name: "longColor", color: "#00FFFFF"};
      await expect(Tag.create(longColor)).rejects.toThrow();
      
      const invalidCharacter = {name: "invalidCharacter", color: "#00000T"};
      await expect(Tag.create(invalidCharacter)).rejects.toThrow();
    });
  });
});
