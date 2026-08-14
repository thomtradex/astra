import { Controller, Get, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {


constructor(
private readonly service:DashboardService
){}


@Get('overview')
overview(@Req() req:any){

return this.service.overview(
req.user.organizationId
)

}

}
