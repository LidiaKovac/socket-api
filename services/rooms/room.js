import { STRING, INTEGER, Model, Sequelize, UUID, UUIDV4 } from "sequelize"

class Room extends Model {
  static initialize(sequelize) {
    this.init(
      {
        id: {
          primaryKey: true,
          type: UUID,
          defaultValue: UUIDV4,
        },
        name: {
          type: STRING(100),
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        modelName: "Room",
      }
    )
  }
}

export default Room
