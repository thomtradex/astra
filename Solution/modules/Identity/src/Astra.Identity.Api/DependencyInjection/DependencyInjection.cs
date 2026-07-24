using Astra.Identity.Application.DependencyInjection;
using Astra.Identity.Infrastructure.DependencyInjection;

namespace Astra.Identity.Api.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection AddIdentityModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddApplication();

        services.AddInfrastructure(configuration);

        return services;
    }
}