import { STRING, INTEGER, Model, Sequelize, UUID, UUIDV4 } from "sequelize"

class User extends Model {
  static initialize(sequelize) {
    this.init(
      {
        id: {
          primaryKey: true,
          type: UUID,
          defaultValue: UUIDV4,
        },
        first_name: {
          type: STRING(100),
          allowNull: false,
        },
        last_name: {
          type: STRING(100),
          allowNull: false,
        },
        linkedinId: {
          type: STRING(100),
          allowNull: false,
        },
        linkedinProPic: {
            type: STRING(200),
            allowNull: true,
            defaultValue: "https://icon-library.com/images/default-profile-icon/default-profile-icon-5.jpg"
        }
      },
      {
        sequelize,
        timestamps: true,
        modelName: "User",
      }
    )
  }
}

export default User
