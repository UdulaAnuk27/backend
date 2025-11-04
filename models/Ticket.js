const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const Ticket = sequelize.define(
  "Ticket",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      onDelete: "CASCADE",
    },
    event_title: { type: DataTypes.STRING, allowNull: false },
    event_date: { type: DataTypes.DATEONLY, allowNull: false },
    venue: { type: DataTypes.STRING, allowNull: false },
    tickets_count: { type: DataTypes.INTEGER, allowNull: false },
    total_price: { type: DataTypes.FLOAT, allowNull: false },
    qr_code: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "tickets",
    timestamps: false,
  }
);

Ticket.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Ticket, { foreignKey: "user_id", as: "tickets" });

module.exports = Ticket;
