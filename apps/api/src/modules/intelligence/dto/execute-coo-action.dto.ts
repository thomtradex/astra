import { IsIn, IsOptional, IsString } from 'class-validator';

export class ExecuteCooActionDto {
  @IsIn([
    'ASSIGN_WORK_ORDER',
    'UPDATE_WORK_ORDER',
  ])
  type!: 
    | 'ASSIGN_WORK_ORDER'
    | 'UPDATE_WORK_ORDER';

  @IsString()
  resourceId!: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  priority?: string;
}
