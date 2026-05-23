import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PropertyProfile = sequelize.define('PropertyProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  // === Core / Common Fields ===
  type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  units: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  bedrooms: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  landArea: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  plotArea: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  UDS_area: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  plotSize: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  poojaRooms: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  bathrooms: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  length: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  breath: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  balconies: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  roadFacing: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  plotAvailable: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  closedParking: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  openParking: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  plotAvailable: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  facing: {
    type: DataTypes.ENUM(
      'East',
      'West',
      'North',
      'South',
      'North-East',
      'North-West',
      'South-East',
      'South-West'
    ),
    defaultValue: 'East'
  },
  carpetArea: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  parkingType: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  areaUnit: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  // areaUnit: {
  //   type: DataTypes.ENUM('sqft', 'sqyd', 'sqm', 'acre', 'hectare'),
  //   defaultValue: 'sqft'
  // },
  buildArea: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  superBuildArea: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },

  // === Commercial / Office / Shop Fields ===
  shopNumber: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  frontage: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  roadWidth: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  pantryAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  washroomAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  cornerShop: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  powerBackup: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  waterSupply: {
    type: DataTypes.STRING(20),
    defaultValue: '24x7'
  },
  officeNumber: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  floorNumber: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  totalFloors: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  workstations: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  cabins: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  conferenceRooms: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  furnishedStatus: {
    type: DataTypes.ENUM('furnished', 'semi-furnished', 'unfurnished'),
    defaultValue: 'furnished'
  },
  acAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  liftAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  parkingSpaces: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  securityAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'property_profiles',
  timestamps: true
});

export default PropertyProfile;
