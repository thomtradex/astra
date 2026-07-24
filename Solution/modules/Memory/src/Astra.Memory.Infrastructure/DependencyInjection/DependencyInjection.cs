using Astra.Memory.Domain.Repositories;
using Astra.Memory.Infrastructure.Persistence;
using Astra.Memory.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Astra.Memory.Infrastructure.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<MemoryDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("MemoryDatabase")));

        services.AddScoped<
            IMemoryCollectionRepository,
            MemoryCollectionRepository>();

        services.AddScoped<
            IMemoryEntryRepository,
            MemoryEntryRepository>();

        return services;
    }
}