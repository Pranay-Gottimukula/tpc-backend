import {
  Inject,
  Injectable,
  ForbiddenException,
  ConflictException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { Op, UniqueConstraintError } from "sequelize";
import { CreateRecruiterFeedbackDto } from "./dtos/post.dto";
import { RecruiterFeedbackSeasonDto } from "./dtos/get.dto";

import {
  RECRUITER_FEEDBACK_DAO,
  RECRUITER_DAO,
  USER_DAO,
  COMPANY_DAO,
  SEASON_DAO,
  JOB_DAO,
} from "../../constants";

import { EmailService, getHtmlContent } from "../../services/EmailService";
import path from "path";
import { RoleEnum } from "../../enums";

@Injectable()
export class RecruiterFeedbackService {
  private readonly logger = new Logger(RecruiterFeedbackService.name);

  constructor(
    @Inject(RECRUITER_FEEDBACK_DAO)
    private readonly feedbackDao: any,

    @Inject(RECRUITER_DAO)
    private readonly recruiterDao: any,

    @Inject(USER_DAO)
    private readonly userDao: any,

    @Inject(COMPANY_DAO)
    private readonly companyDao: any,

    @Inject(SEASON_DAO)
    private readonly seasonDao: any,

    @Inject(JOB_DAO)
    private readonly jobDao: any,

    private readonly emailService: EmailService,
  ) {}

  // ======================================================
  // POST: Submit Recruiter Feedback
  // ======================================================
  async submitFeedback(body: CreateRecruiterFeedbackDto, userId: string) {
    const recruiter = await this.recruiterDao.findOne({
      where: { userId },
      include: ["user"],
    });

    if (!recruiter) {
      throw new ForbiddenException("Only recruiters can submit feedback");
    }

    const company = await this.companyDao.findByPk(recruiter.companyId);
    const season = await this.seasonDao.findByPk(body.seasonId);

    if (!season) {
      throw new NotFoundException("Season not found");
    }

    const job = await this.jobDao.findOne({
      where: { companyId: recruiter.companyId, seasonId: body.seasonId },
    });

    if (!job) {
      throw new ForbiddenException(
        "Recruiter is not eligible to submit feedback for this season"
      );
    }

    let feedback;
    try {
      feedback = await this.feedbackDao.create({
        recruiterId: recruiter.id,
        companyId: recruiter.companyId,
        seasonId: body.seasonId,

        communicationPromptness: body.communicationPromptness,
        queryHandling: body.queryHandling,
        logisticsArrangement: body.logisticsArrangement,
        studentFamiliarity: body.studentFamiliarity,
        studentCommunication: body.studentCommunication,
        resumeQuality: body.resumeQuality,
        studentPreparedness: body.studentPreparedness,
        disciplineAndPunctuality: body.disciplineAndPunctuality,

        rightTimeToContact: body.rightTimeToContact,
        recommendations: body.recommendations,
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new ConflictException("Feedback already submitted for this season");
      }
      throw error;
    }

    await this.notifyAdmins(feedback, recruiter, company, season);

    return feedback;
  }

  private async notifyAdmins(feedback: any, recruiter: any, company: any, season: any) {
    try {
      const admins = await this.userDao.findAll({
        where: { role: RoleEnum.ADMIN },
        attributes: ["email"],
      });

      const recepients = admins.map(a => ({ address: a.email }));

      const templatePath = path.resolve(
        process.cwd(),
        "src/html",
        "RecruiterFeedbackToAdmin.html"
      );

      const html = getHtmlContent(templatePath, {
        companyName: company?.name ?? "",
        season: `${season?.year ?? ""} ${season?.type ?? ""}`,
        officialName: recruiter.user?.name ?? "",
        designation: recruiter.designation ?? "",
        officialEmail: recruiter.user?.email ?? "",
        url: `${process.env.FRONTEND_URL ?? ""}/admin/feedback/${feedback.id}`,
      });

      await this.emailService.sendEmail({
        recepients,
        subject: `Recruiter Feedback Submitted by ${company?.name ?? ""}`,
        html,
      });
    } catch (err) {
      this.logger.error(
        `Feedback email failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // ======================================================
  // GET: Seasons Eligible for Recruiter Feedback
  // ======================================================
  async getRecruiterFeedbackSeasons(
    userId: string
  ): Promise<RecruiterFeedbackSeasonDto[]> {
    const recruiter = await this.recruiterDao.findOne({
      where: { userId },
    });

    if (!recruiter) {
      throw new ForbiddenException("Only recruiters can view feedback seasons");
    }

    // Jobs → seasons
    const jobs = await this.jobDao.findAll({
      where: { companyId: recruiter.companyId },
      attributes: ["seasonId"],
    });

    const seasonIds = [
      ...new Set(jobs.map(j => j.seasonId).filter(Boolean)),
    ];

    if (seasonIds.length === 0) {
      return [];
    }

    // Fetch seasons
    const seasons = await this.seasonDao.findAll({
      where: { id: { [Op.in]: seasonIds } },
      order: [["year", "DESC"]],
    });

    // Fetch submitted feedbacks
    const feedbacks = await this.feedbackDao.findAll({
      where: { recruiterId: recruiter.id },
      attributes: ["seasonId"],
    });

    const submittedSeasonIds = new Set(
      feedbacks.map(f => f.seasonId)
    );

    return seasons.map(season => ({
      id: season.id,
      year: season.year,
      type: season.type,
      status: season.status,
      feedbackSubmitted: submittedSeasonIds.has(season.id),
    }));
  }
}
