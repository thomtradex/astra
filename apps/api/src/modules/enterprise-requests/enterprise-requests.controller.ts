import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/decorators/metadata.decorators';
import { CreateEnterpriseRequestDto } from './dto/create-enterprise-request.dto';
import { EnterpriseRequestsService } from './enterprise-requests.service';

@ApiTags('Enterprise Requests')
@Controller('enterprise-requests')
export class EnterpriseRequestsController {
  constructor(private readonly service: EnterpriseRequestsService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit an Enterprise customization request' })
  create(@Body() dto: CreateEnterpriseRequestDto) {
    return this.service.create(dto);
  }
}
