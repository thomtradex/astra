import {
  IsIn,
  IsNumber,
  IsUUID,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateInventoryMovementDto {
  @IsUUID()
  siteId!: string;

  @IsUUID()
  materialId!: string;

  @IsIn([
    'ADJUSTMENT_IN',
    'ADJUSTMENT_OUT',
    'RECEIPT',
    'RETURN',
  ])
  movementType!:
    | 'ADJUSTMENT_IN'
    | 'ADJUSTMENT_OUT'
    | 'RECEIPT'
    | 'RETURN';

  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;
}
