import { IsIn } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsIn(['STARTER', 'PROFESSIONAL', 'ENTERPRISE'])
  planCode!: string;
}
