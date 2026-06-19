import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import slugify from 'slugify';

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'clients',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    // unique: true
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  },
  addressId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'addresses',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  propertyProfileId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'property_profiles',
      key: 'id'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  },
  propertyName: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  marketType: {
    type: DataTypes.ENUM('Sale', 'Rent', 'Lease'),
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  advance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  photos: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  videos: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  audio: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  youtubeUrl: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  approvedBy: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  amenities: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    get() {
      const value = this.getDataValue('amenities');
      if (!value) return [];
      try {
        // If it's stored as a string in DB, parse it safely
        return typeof value === 'string' ? JSON.parse(value) : value;
      } catch (err) {
        console.error('Invalid amenities JSON:', value);
        return [];
      }
    },
    set(value) {
      // Ensure only arrays (or valid JSON) are stored
      if (Array.isArray(value)) {
        this.setDataValue('amenities', value);
      } else if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          this.setDataValue('amenities', Array.isArray(parsed) ? parsed : []);
        } catch {
          this.setDataValue('amenities', []);
        }
      } else {
        this.setDataValue('amenities', []);
      }
    },
  },

  availableStatus: {
    type: DataTypes.ENUM('Ready to Move', 'Under Construction'),
    defaultValue: 'Ready to Move'
  },
  ageOfProperty: {
    type: DataTypes.STRING,
    allowNull: true
  },
  possession: {
    type: DataTypes.STRING,
    allowNull: true
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  thisMonthCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  Inquiries: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  renewalDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected', 'inactive'),
    defaultValue: 'pending'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isSold: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'project',
  hooks: {
    beforeCreate: (property) => {
      property.slug = slugify(property.title, {
        lower: true,
        strict: true
      });
  
      const renewal = new Date();
      renewal.setDate(renewal.getDate() + 60);
      property.renewalDate = renewal;
    },
  
    beforeUpdate: (property) => {
      if (property.changed('title')) {
        property.slug = slugify(property.title, {
          lower: true,
          strict: true
        });
      }
    }
  }});

export default Project;
