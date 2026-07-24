using Astra.Agents.Domain.Repositories;
using Astra.Agents.Infrastructure.Persistence;
using Astra.Agents.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Astra.Agents.Infrastructure.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<AgentsDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("AgentsDatabase")));

        services.AddScoped<IAgentRepository, AgentRepository>();
        services.AddScoped<IAgentCapabilityRepository, AgentCapabilityRepository>();

        return services;
    }
}