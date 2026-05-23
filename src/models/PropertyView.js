// models/PropertyView.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PropertyView = sequelize.define('PropertyView', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  propertyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'properties',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'clients', // or 'users' — depends on your schema
      key: 'id'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  },
  viewedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'property_views',
  timestamps: false // viewedAt handles time tracking
});

export default PropertyView;
