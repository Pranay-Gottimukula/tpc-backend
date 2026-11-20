import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import sequelize from "sequelize";
import { RecruiterModel } from "./RecruiterModel";
import { CompanyModel } from "./CompanyModel";
import { SeasonModel } from "./SeasonModel";

@Table({
  tableName: "RecruiterFeedback",
})
export class RecruiterFeedbackModel extends Model<RecruiterFeedbackModel> {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: sequelize.UUID,
    defaultValue: sequelize.UUIDV4,
  })
  id: string;

  /* ---------- Recruiter ---------- */
  @ForeignKey(() => RecruiterModel)
  @Column({
    allowNull: false,
    type: sequelize.UUID,
  })
  recruiterId: string;

  @BelongsTo(() => RecruiterModel)
  recruiter: RecruiterModel;

  /* ---------- Company ---------- */
  @ForeignKey(() => CompanyModel)
  @Column({
    allowNull: false,
    type: sequelize.UUID,
  })
  companyId: string;

  @BelongsTo(() => CompanyModel)
  company: CompanyModel;

  /* ---------- Season ---------- */
  @ForeignKey(() => SeasonModel)
  @Column({
    allowNull: false,
    type: sequelize.UUID,
  })
  seasonId: string;

  @BelongsTo(() => SeasonModel)
  season: SeasonModel;

  /* ---------- Ratings ---------- */
  @Column({ allowNull: false, type: sequelize.INTEGER, validate: { min: 1, max: 5 } })
  communicationPromptness: number;

  @Column({ allowNull: false, type: sequelize.INTEGER, validate: { min: 1, max: 5 } })
  queryHandling: number;

  @Column({ allowNull: false, type: sequelize.INTEGER, validate: { min: 1, max: 5 } })
  logisticsArrangement: number;

  @Column({ allowNull: false, type: sequelize.INTEGER, validate: { min: 1, max: 5 } })
  studentFamiliarity: number;

  @Column({ allowNull: false, type: sequelize.INTEGER, validate: { min: 1, max: 5 } })
  studentCommunication: number;

  @Column({ allowNull: false, type: sequelize.INTEGER, validate: { min: 1, max: 5 } })
  resumeQuality: number;

  @Column({ allowNull: false, type: sequelize.INTEGER, validate: { min: 1, max: 5 } })
  studentPreparedness: number;

  @Column({ allowNull: false, type: sequelize.INTEGER, validate: { min: 1, max: 5 } })
  disciplineAndPunctuality: number;

  /* ---------- Other ---------- */
  @Column({ allowNull: false, type: sequelize.STRING })
  rightTimeToContact: string;

  @Column(sequelize.TEXT)
  recommendations: string;
}
