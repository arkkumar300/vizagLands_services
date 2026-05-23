import sequelize from '../config/database.js';
import Admin from './Admin.js';
import Category from './Category.js';
import Address from './Address.js';
import Client from './Client.js';
import PropertyProfile from './PropertyProfile.js';
import Property from './Property.js';
// import Project from './Projects.js';
import Lead from './Lead.js';
import Blog from './Blog.js';
import PropertyView from './PropertyView.js';
import City from './City.js';
// import Favorite from './Favorite.js';

// ----------------------
// Property Relationships
// ----------------------
Property.belongsTo(Client, { foreignKey: 'clientId', as: 'client', onDelete: 'CASCADE' });
Client.hasMany(Property, { foreignKey: 'clientId', as: 'properties' });

Property.belongsTo(Category, { foreignKey: 'categoryId', as: 'category', onDelete: 'RESTRICT' });
Category.hasMany(Property, { foreignKey: 'categoryId', as: 'properties' });

Property.belongsTo(Address, { foreignKey: 'addressId', as: 'address', onDelete: 'CASCADE' });
Address.hasOne(Property, { foreignKey: 'addressId', as: 'property' });

Property.belongsTo(PropertyProfile, { foreignKey: 'propertyProfileId', as: 'profile', onDelete: 'SET NULL' });
PropertyProfile.hasOne(Property, { foreignKey: 'propertyProfileId', as: 'property' });

// Project.belongsTo(Client, { foreignKey: 'clientId', as: 'client', onDelete: 'CASCADE' });
// Client.hasMany(Project, { foreignKey: 'clientId', as: 'projects' });

// Project.belongsTo(Category, { foreignKey: 'categoryId', as: 'category', onDelete: 'RESTRICT' });
// Category.hasMany(Project, { foreignKey: 'categoryId', as: 'projects' });

// Project.belongsTo(Address, { foreignKey: 'addressId', as: 'address', onDelete: 'CASCADE' });
// Address.hasOne(Project, { foreignKey: 'addressId', as: 'project' });

// Project.belongsTo(PropertyProfile, { foreignKey: 'propertyProfileId', as: 'profile', onDelete: 'SET NULL' });
// PropertyProfile.hasOne(Project, { foreignKey: 'propertyProfileId', as: 'project' });

// ----------------------
// Lead Relationships
// ----------------------
Lead.belongsTo(Property, { foreignKey: 'propertyId', as: 'property', onDelete: 'CASCADE' });
Property.hasMany(Lead, { foreignKey: 'propertyId', as: 'leads' });

// ----------------------
// PropertyView Relationships
// ----------------------
PropertyView.belongsTo(Property, { foreignKey: 'propertyId', as: 'property', onDelete: 'CASCADE' });
Property.hasMany(PropertyView, { foreignKey: 'propertyId', as: 'views' });

// ----------------------
// Favorites Relationships (Many-to-Many)
// ----------------------
// Client.belongsToMany(Property, { through: Favorite, foreignKey: 'clientId', as: 'favorites' });
// Property.belongsToMany(Client, { through: Favorite, foreignKey: 'propertyId', as: 'favoritedBy' });

// ----------------------
// Optional: Include favorite directly in Property/Client
// ----------------------
// Property.hasMany(Favorite, { foreignKey: 'propertyId', as: 'favoriteRecords' });
// Client.hasMany(Favorite, { foreignKey: 'clientId', as: 'favoriteRecords' });

// ----------------------
// Export Models
// ----------------------
const models = {
  Admin,
  Category,
  Address,
  Client,
  PropertyProfile,
  Property,
  Lead,
  Blog,
  PropertyView,
  City,
  sequelize
};

export default models;
