const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const UserDetails = sequelize.define(
  "UserDetails",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: { isEmail: true },
    },
    profile_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "user_details",
    timestamps: false,
  }
);

// Define associations
User.hasOne(UserDetails, { foreignKey: "user_id", as: "details" });
UserDetails.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = UserDetails;
