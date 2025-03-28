import { User, Project, Task, Tag, sequelize } from '../models';
import { faker } from '@faker-js/faker';

const statuses = ['pending', 'in_progress', 'completed'] as const;
const priorities = ['low', 'medium', 'high'] as const;
const projectStatuses = ['active', 'completed'] as const;

const colors = [
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF',
  '#00FFFF', '#FFA500', '#800080', '#008000', '#FFC0CB'
];

async function seed() {
  try {
    // Sync database to create tables
    await sequelize.sync({ force: true });
    console.log('Database synced successfully');

    // Create users
    const users = await Promise.all(
      Array(5).fill(null).map(async () => {
        return await User.create({
          username: faker.internet.userName(),
          email: faker.internet.email(),
          password: faker.internet.password(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName()
        });
      })
    );
    // const users: User[] = [];
    // for (let i = 0; i < 5; i++) {
    //   const user = await User.create({
    //     username: faker.internet.userName(),
    //     email: faker.internet.email(),
    //     password: faker.internet.password(),
    //     firstName: faker.person.firstName(),
    //     lastName: faker.person.lastName()
    //   });
    //   users.push(user);
    // }

    // Create tags
    const tags = await Promise.all(
      Array(8).fill(null).map(async (_, index) => {
        return await Tag.create({
          name: faker.word.words(2),
          color: colors[index % colors.length]
        });
      })
    );

    // Create projects
    const projects = await Promise.all(
      Array(10).fill(null).map(async () => {
        const startDate = faker.date.past();
        const endDate = faker.date.future({ years: 1, refDate: startDate });
        
        return await Project.create({
          name: faker.company.name(),
          description: faker.company.catchPhrase(),
          status: projectStatuses[Math.floor(Math.random() * projectStatuses.length)] as 'active' | 'completed',
          startDate,
          endDate,
          userId: users[Math.floor(Math.random() * users.length)].id
        });
      })
    );

    // Create tasks
    const tasks = await Promise.all(
      Array(50).fill(null).map(async () => {
        // Generate a future due date
        const dueDate = faker.date.future({ years: 1 });
        
        // Create task with validation
        const task = await Task.create({
          title: faker.company.catchPhrase().slice(0, 100), // Ensure title is within length limit
          description: faker.lorem.paragraph().slice(0, 1000), // Ensure description is within length limit
          status: statuses[Math.floor(Math.random() * statuses.length)],
          dueDate,
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          userId: users[Math.floor(Math.random() * users.length)].id,
          projectId: projects[Math.floor(Math.random() * projects.length)].id
        });

        // Randomly assign 1-3 tags to each task
        const numTags = Math.floor(Math.random() * 3) + 1;
        const selectedTags = faker.helpers.arrayElements(tags, numTags);
        await (task as any).setTags(selectedTags);

        // Demonstrate instance methods
        console.log(`Task ${task.id}:`);
        console.log(`- Title: ${task.title}`);
        console.log(`- Status: ${task.status}`);
        console.log(`- Due Date: ${task.dueDate}`);
        console.log(`- Is Overdue: ${task.isOverdue()}`);
        console.log(`- Progress: ${task.getProgress()}`);
        console.log('---');

        return task;
      })
    );

    console.log('Seed data created successfully!');
    console.log(`Created ${users.length} users`);
    console.log(`Created ${projects.length} projects`);
    console.log(`Created ${tags.length} tags`);
    console.log(`Created ${tasks.length} tasks`);
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}

// Run the seeder
seed(); 