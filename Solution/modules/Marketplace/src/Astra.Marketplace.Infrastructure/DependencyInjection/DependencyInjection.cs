using Astra.Marketplace.Domain.Repositories;
using Astra.Marketplace.Infrastructure.Persistence;
using Astra.Marketplace.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Astra.Marketplace.Infrastructure.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<MarketplaceDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("MarketplaceDatabase")));

        services.AddScoped<IPluginRepository, PluginRepository>();

        return services;
    }
}