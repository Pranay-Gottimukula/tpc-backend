'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("RecruiterFeedback", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
      },

      /* ---------- Recruiter ---------- */
      recruiterId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Recruiter",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      /* ---------- Company ---------- */
      companyId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Company",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      /* ---------- Season ---------- */
      seasonId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Season",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      /* ---------- Ratings ---------- */
      communicationPromptness: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      queryHandling: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      logisticsArrangement: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      studentFamiliarity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      studentCommunication: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      resumeQuality: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      studentPreparedness: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      disciplineAndPunctuality: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      /* ---------- Other ---------- */
      rightTimeToContact: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      recommendations: {
        type: Sequelize.TEXT,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    /* ---------- UNIQUE CONSTRAINT ---------- */
    await queryInterface.addConstraint("RecruiterFeedback", {
      fields: ["recruiterId", "seasonId"],
      type: "unique",
      name: "unique_recruiter_feedback_per_season",
    });

    const ratingFields = [
      "communicationPromptness",
      "queryHandling",
      "logisticsArrangement",
      "studentFamiliarity",
      "studentCommunication",
      "resumeQuality",
      "studentPreparedness",
      "disciplineAndPunctuality",
    ];

    for (const field of ratingFields) {
      await queryInterface.addConstraint("RecruiterFeedback", {
        fields: [field],
        type: "check",
        where: { [field]: { [Sequelize.Op.between]: [1, 5] } },
        name: `check_recruiter_feedback_${field}_range`,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable("RecruiterFeedback");
  },
};
