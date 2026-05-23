import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Favorite = sequelize.define("Favorite", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "clients",
      key: "id",
    },
    onDelete: "CASCADE"
  },
  propertyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "properties",
      key: "id",
    },
    onDelete: "CASCADE"
  },
}, {
  tableName: "favorites",
  indexes: [
    {
      unique: true,
      fields: ["clientId", "propertyId"], // prevents duplicate favorites
    },
  ],
});

export default Favorite;
