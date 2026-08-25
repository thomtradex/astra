import { IsIn } from 'class-validator';

export class UpgradePlanDto {
  @IsIn(['STARTER', 'PROFESSIONAL', 'ENTERPRISE'])
  planCode!: string;
}
