import {
  NestedNumber,
  NestedString,
  NestedUUID,
} from "src/decorators/dto";
import { IsInt, Max, MaxLength, Min } from "class-validator";

function Rating() {
  return (target: any, key: string) => {
    NestedNumber({})(target, key);
    IsInt()(target, key);
    Min(1)(target, key);
    Max(5)(target, key);
  };
}

export class CreateRecruiterFeedbackDto {
  /* ----------- Context ----------- */

  @NestedUUID({})
  seasonId: string;

  /* ----------- Ratings ----------- */

  @Rating()
  communicationPromptness: number;

  @Rating()
  queryHandling: number;

  @Rating()
  logisticsArrangement: number;

  @Rating()
  studentFamiliarity: number;

  @Rating()
  studentCommunication: number;

  @Rating()
  resumeQuality: number;

  @Rating()
  studentPreparedness: number;

  @Rating()
  disciplineAndPunctuality: number;

  /* ----------- Text ----------- */

  @NestedString({})
  @MaxLength(255)
  rightTimeToContact: string;

  @NestedString({ optional: true })
  @MaxLength(5000)
  recommendations?: string;
}
