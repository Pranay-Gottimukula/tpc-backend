# Recruiter feedback

Recruiters can submit one feedback response per season for a company that has a job in that season. Administrators can list submissions and view an individual response.

## Routes and access

The application uses the `/api/v1` global prefix.

| Method and URL | Access | Result |
| --- | --- | --- |
| `GET /api/v1/recruiter-feedback/seasons` | Recruiter JWT | Seasons with a job for the recruiter's company, including whether the recruiter has submitted feedback for each season. |
| `POST /api/v1/recruiter-feedback` | Recruiter JWT | Submits feedback and returns `{ "success": true }`. |
| `GET /api/v1/admin/feedback` | Admin JWT | Paginated and filterable feedback list. |
| `GET /api/v1/admin/feedback/:id` | Admin JWT | Full feedback record with recruiter, user, company, and season details. `:id` must be a UUID. |

Recruiter routes require `RoleEnum.RECRUITER`; admin routes require `RoleEnum.ADMIN`. Both use the JWT auth guard.

## Submission payload

`POST /api/v1/recruiter-feedback` accepts a JSON object with:

| Field | Validation |
| --- | --- |
| `seasonId` | UUID |
| `communicationPromptness` | Integer from 1 through 5 |
| `queryHandling` | Integer from 1 through 5 |
| `logisticsArrangement` | Integer from 1 through 5 |
| `studentFamiliarity` | Integer from 1 through 5 |
| `studentCommunication` | Integer from 1 through 5 |
| `resumeQuality` | Integer from 1 through 5 |
| `studentPreparedness` | Integer from 1 through 5 |
| `disciplineAndPunctuality` | Integer from 1 through 5 |
| `rightTimeToContact` | Required string, at most 255 characters |
| `recommendations` | Optional string, at most 5,000 characters |

Example:

```json
{
  "seasonId": "00000000-0000-4000-8000-000000000001",
  "communicationPromptness": 4,
  "queryHandling": 5,
  "logisticsArrangement": 4,
  "studentFamiliarity": 3,
  "studentCommunication": 4,
  "resumeQuality": 5,
  "studentPreparedness": 4,
  "disciplineAndPunctuality": 5,
  "rightTimeToContact": "Weekday mornings",
  "recommendations": "Share role requirements before the interview."
}
```

## Eligibility and errors

The service finds the recruiter from the authenticated user. The requested season must exist, and the recruiter's company must have at least one `Job` for that season. Missing seasons return 404; ineligible recruiters return 403. Submitting a second response for the same recruiter and season returns 409 (`Feedback already submitted for this season`). The unique database constraint is the concurrency-safe duplicate check.

DTO validation errors and malformed UUIDs return 400. Missing or invalid authentication returns 401; an authenticated user with the wrong role returns 403.

## Admin reads

The feedback list returns `id`, recruiter name/email/designation, company name, season year/type, and creation time. `FeedbackQueryDto` supports `from`/`to` pagination, `filterBy` fields for feedback ID, recruiter and user details, company name, and season year/type, plus `orderBy` for creation time and included recruiter, company, or season fields.

The detail endpoint returns the stored feedback fields and associations. It limits associated columns to recruiter designation, user name/email, company name, and season year/type. A valid UUID without a matching feedback row returns 404.

## Persistence and notifications

`RecruiterFeedbackModel` maps to the `RecruiterFeedback` table. Migration [`20251228103228-create-recruiter-feedback.js`](../migrations/20251228103228-create-recruiter-feedback.js) creates the table with required ratings and contact-time text, a unique `(recruiterId, seasonId)` constraint, and a 1–5 CHECK constraint for each rating column. The model also validates rating bounds.

After the row is created, the service emails users with the admin role using `src/html/RecruiterFeedbackToAdmin.html`. The message links to `/admin/feedback/:feedbackId` under `FRONTEND_URL`. Mail delivery is best effort: `EmailService.sendEmail()` returns a promise, and notification failures are logged without failing the successful submission.

## Code map

- Recruiter route and orchestration: [`recruiter-feedback.controller.ts`](../src/feedback/recruiter/recruiter-feedback.controller.ts), [`recruiter-feedback.service.ts`](../src/feedback/recruiter/recruiter-feedback.service.ts)
- Submission DTO: [`post.dto.ts`](../src/feedback/recruiter/dtos/post.dto.ts)
- Admin route and query: [`admin-feedback.controller.ts`](../src/feedback/admin/admin-feedback.controller.ts), [`admin-feedback.service.ts`](../src/feedback/admin/admin-feedback.service.ts), [`query.dto.ts`](../src/feedback/admin/dtos/query.dto.ts)
- Model and migration: [`RecruiterFeedbackModel.ts`](../src/db/models/RecruiterFeedbackModel.ts), [`20251228103228-create-recruiter-feedback.js`](../migrations/20251228103228-create-recruiter-feedback.js)
- Mail transport: [`EmailService.ts`](../src/services/EmailService.ts)
