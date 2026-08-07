import {
  IsISO8601,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateMaintenancePlanDto {
  @IsString()
  @IsNotEmpty()
  plan!: string;

  @IsString()
  @IsNotEmpty()
  assetId!: string;

  @IsString()
  @IsNotEmpty()
  frequency!: string;

  @IsISO8601()
  nextDue!: string;
}
