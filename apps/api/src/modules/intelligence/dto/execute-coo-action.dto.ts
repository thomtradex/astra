import { IsIn, IsString } from 'class-validator';

export class ExecuteCooActionDto {
  @IsIn(['ASSIGN_WORK_ORDER'])
  type!: 'ASSIGN_WORK_ORDER';

  @IsString()
  resourceId!: string;

  @IsString()
  assignedToId!: string;
}
