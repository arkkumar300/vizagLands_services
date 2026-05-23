import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Address = sequelize.define('Address', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  propertyId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'properties',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'project',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  locality: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  subLocality: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  apartmentDoorNo: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  lat: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  lon: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  near_by: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    get() {
      const rawValue = this.getDataValue('near_by');
      if (!rawValue) return [];
      try {
        if (typeof rawValue === 'string') {
          return JSON.parse(rawValue);
        }
        if (Array.isArray(rawValue)) {
          return rawValue;
        }
      } catch (err) {
        console.error('Invalid near_by JSON:', rawValue);
      }
      return [];
    },
  },
  
  road_facing: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  pincode: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  fullAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'addresses'
});

export default Address;
