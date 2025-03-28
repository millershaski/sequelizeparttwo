/**
 * Project Model
 * 
 * This model represents a project in the task management system.
 * It demonstrates:
 * 1. TypeScript interfaces for type safety
 * 2. Sequelize model definition with validations
 * 3. Instance methods for business logic
 * 4. Database relationships (belongsTo, hasMany)
 * 5. Custom validations and hooks
 */

import { Model, DataTypes } from 'sequelize';
import { User } from './User';
import { Task } from './Task';
import sequelize from '../config/database';

// Keep the simple enum type
export type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'cancelled';


/**
 * Project Model Class
 * 
 * Extends Sequelize's Model class to create a Project model with:
 * - Type-safe attributes
 * - Validations
 * - Instance methods
 * - Database relationships
 */
export class Project extends Model {
  // Basic properties
  public id!: number;
  public name!: string;
  public description!: string;
  public status!: ProjectStatus;
  public startDate!: Date;
  public endDate!: Date;
  public userId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Simple association methods
  public getUser!: () => Promise<User>;
  public getTasks!: () => Promise<Task[]>;

  /**
   * Calculate the project's progress based on its tasks
   * 
   * This method:
   * 1. Fetches all tasks associated with the project
   * 2. Calculates the percentage of completed tasks
   * 3. Returns the progress as a percentage string
   * 
   * @returns Promise<string> - Progress percentage (e.g., "75%")
   */
  public async getProgress(): Promise<string> 
  {
    const allTasks = await Task.findAll({where: {projectId: this.id}});
    if(allTasks.length == 0)
      return "0%";

    let finishedCount = 0;
    for(let task of allTasks)
    {
      if(task.status == "completed")
        finishedCount++;
    }    
    const asPercent = (finishedCount / allTasks.length) * 100;
    return asPercent + '%';
  }
}

// Initialize the Project model with Sequelize
Project.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 100] // Name must be between 3 and 100 characters
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
      validate:
      {
        ValidateStatus(value: any)
        {
          if(value == null)
            throw new Error('Status is null');

          if(value != "active" && value != "completed" && value != "on_hold" && value != "cancelled")
            throw new Error("Status had unexpected value. Look to ProjectStatus for correct values");
        }    
      }
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isAfterStartDate(value: Date) {
          const project = this as unknown as Project;
          if (value <= project.startDate) {
            throw new Error('End date must be after start date');
          }
        }
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
  
    
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'projects',
    modelName: 'Project',
    timestamps: true, // Adds createdAt and updatedAt fields
    indexes: [
      {
        fields: ['userId'], // Index for faster user-based queries
      },
      {
        fields: ['status'], // Index for faster status-based queries
      }
    ],
   
  }
); 