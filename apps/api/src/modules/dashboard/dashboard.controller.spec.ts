import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  const dashboardService = {
    overview: jest.fn(),
  };

  const billingService = {
    getEntitlements: jest.fn(),
  };

  let controller: DashboardController;

  beforeEach(() => {
    jest.clearAllMocks();

    controller = new DashboardController(
      dashboardService as unknown as DashboardService,
      billingService as never,
    );
  });

  it('includes intelligence when the organization is entitled to it', async () => {
    billingService.getEntitlements.mockResolvedValue({
      features: {
        intelligence: true,
      },
    });

    dashboardService.overview.mockResolvedValue({
      customers: 10,
    });

    const user = {
      organizationId: 'org-1',
    };

    const result = await controller.overview(user as never);

    expect(billingService.getEntitlements).toHaveBeenCalledWith('org-1');
    expect(dashboardService.overview).toHaveBeenCalledWith('org-1', true);
    expect(result).toEqual({
      customers: 10,
    });
  });

  it('keeps intelligence disabled when the organization is not entitled to it', async () => {
    billingService.getEntitlements.mockResolvedValue({
      features: {
        intelligence: false,
      },
    });

    dashboardService.overview.mockResolvedValue({
      customers: 10,
    });

    const user = {
      organizationId: 'org-1',
    };

    await controller.overview(user as never);

    expect(billingService.getEntitlements).toHaveBeenCalledWith('org-1');
    expect(dashboardService.overview).toHaveBeenCalledWith('org-1', false);
  });
});
