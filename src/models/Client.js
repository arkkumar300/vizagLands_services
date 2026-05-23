import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    // unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    // unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('owner', 'agent', 'builder','admin'),
    allowNull: false,
    defaultValue: 'owner'
  },
  otp: {
    type: DataTypes.STRING(6)
  },
  otp_expiry: {
    type: DataTypes.DATE
  },
  failed_otp_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  last_otp_verified: {
    type: DataTypes.DATE
  },
  kycProofName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  kycProofNumber: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  kycUploadFile: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  profilePic: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  companyName: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  area: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  postLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 2,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'clients',
  hooks: {
    beforeCreate: async (client) => {
      if (client.password) {
        client.password = await bcrypt.hash(client.password, 10);
      }
    },
    beforeUpdate: async (client) => {
      if (client.changed('password')) {
        client.password = await bcrypt.hash(client.password, 10);
      }
    }
  }
});

Client.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default Client;
