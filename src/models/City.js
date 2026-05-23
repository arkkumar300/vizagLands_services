// models/City.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const City = sequelize.define('City', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  city: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  locality: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    get() {
      const raw = this.getDataValue('locality');
      try {
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    },
    set(value) {
      this.setDataValue('locality', JSON.stringify(value || []));
    }
  }
  }, {
  tableName: 'cities',
  timestamps: true
});

export default City;
