import { STRING, INTEGER, Model, Sequelize, UUID, UUIDV4 } from "sequelize"

class Message extends Model {
  static initialize(sequelize) {
    this.init(
      {
        id: {
          primaryKey: true,
          type: UUID,
          defaultValue: UUIDV4,
        },
        content: {
          type: STRING(100),
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        modelName: "Message",
      }
    )
  }
}

export default Message
