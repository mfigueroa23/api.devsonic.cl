export class CreateExperienceDto {
  period: string;
  role: string;
  company: string;
  description: string;
  technologies: string;
  current?: boolean;
}
