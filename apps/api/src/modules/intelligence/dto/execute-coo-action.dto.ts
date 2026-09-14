import { IsISO8601, IsIn, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class ExecuteCooActionDto {
  @IsIn(['ASSIGN_WORK_ORDER', 'UPDATE_MAINTENANCE', 'SET_PROJECT_STATUS'])
  type!: 'ASSIGN_WORK_ORDER' | 'UPDATE_MAINTENANCE' | 'SET_PROJECT_STATUS';

  @IsString()
  @IsNotEmpty()
  resourceId!: string;

  @ValidateIf((dto: ExecuteCooActionDto) => dto.type === 'ASSIGN_WORK_ORDER')
  @IsString()
  @IsNotEmpty()
  assignedToId?: string;

  @ValidateIf((dto: ExecuteCooActionDto) => dto.type === 'UPDATE_MAINTENANCE')
  @IsISO8601()
  @IsNotEmpty()
  nextDue?: string;

  @ValidateIf((dto: ExecuteCooActionDto) => dto.type === 'SET_PROJECT_STATUS')
  @IsIn(['ON_HOLD'])
  status?: 'ON_HOLD';
}
