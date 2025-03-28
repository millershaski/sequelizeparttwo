/**
 * User Model
 * 
 * This model represents a user in the task management system.
 * It demonstrates:
 * 1. TypeScript interfaces for type safety
 * 2. Sequelize model definition with validations
 * 3. Database relationships (hasMany)
 * 4. Password hashing and validation
 * 5. Email format validation
 */

import { Model, DataTypes } from 'sequelize';
import { Task } from './Task';
import { Project, ProjectStatus } from './Project';
import sequelize from '../config/database';



/**
 * User Model Class
 * 
 * Extends Sequelize's Model class to create a User model with:
 * - Type-safe attributes
 * - Validations
 * - Database relationships
 * - Password handling
 */
export class User extends Model {
  // Basic properties
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public firstName!: string;
  public lastName!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Simple association types
  public getTasks!: () => Promise<any[]>;
  public getProjects!: () => Promise<any[]>;

  /**
   * Get the user's full name
   * 
   * @returns string - The user's full name
   */
  public getFullName(): string {
    return this.firstName + " " + this.lastName;
  }

  /**
   * Get the user's task completion rate
   * 
   * @returns Promise<string> - Completion rate percentage (e.g., "75%")
   */
  public async getTaskCompletionRate(): Promise<string> {    
    const allTasks = await Task.findAll({where: {userId: this.id}});
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

  /**
   * Get the user's active projects count
   * 
   * @returns Promise<number> - Number of active projects
   */
  public async getActiveProjectsCount(): Promise<number> 
  {
    const allProjects = await Project.findAll({where: {userId: this.id, status: 'active'}});
    return allProjects.length;
  }


}

// Initialize the User model with Sequelize
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate:
      {
        len:[3, 30],
        ValidateUserName(value: any)
        {
          if((/^(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?])/).test(value) == true)
            throw new Error("User name should not contain any special characters");
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate:
      {
        ValidateEmail(value: any)
        {
          if((/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/).test(value) == false)
            throw new Error("Email is not in a valid format");
        }
      },      
      set(value: any)
      {
        if(value == null)
          return null;

        this.setDataValue("email", value.toLowerCase());   
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate:
      {
        len:[8, 100],
        ValidatePassword(value: any)
        {
          if((/^(?=.*[A-Z])/).test(value) == false)
            throw new Error("Password does not contain at least one uppercase letter");
          
          if((/^(?=.*[\d])/).test(value) == false)
            throw new Error("Password does not contain at least one number");
          
          if((/^(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?])/).test(value) == false)
            throw new Error("Password does not contain at least one special character");
        }
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate:
      {
        len:[2, 50],
        ValidateName(value: any)
        {
          if((/^(?=.*[\d])/).test(value) == true)
            throw new Error("lastName should not contain any numbers");

          if((/^(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?])/).test(value) == true)
            throw new Error("firstName should not contain any special characters");
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate:
      {
        len:[2, 50],
        ValidateName(value: any)
        {
          if((/^(?=.*[\d])/).test(value) == true)
            throw new Error("lastName should not contain any numbers");

            if((/^(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?])/).test(value) == true)
              throw new Error("lastName should not contain any special characters");
        }
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
    tableName: 'users',
    modelName: 'User',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['username']
      },
      {
        unique: true,
        fields: ['email']
      }
    ],
    hooks: {
    
    },
    
   
  }
); 