using Astra.CompanyBrain.Domain.Repositories;
using Astra.CompanyBrain.Infrastructure.Persistence;
using Astra.CompanyBrain.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Astra.CompanyBrain.Infrastructure.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection AddCompanyBrainInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<CompanyBrainDbContext>(
            options =>
            {
                options.UseInMemoryDatabase(
                    "CompanyBrain");
            });

        services.AddScoped<IBrainRepository, BrainRepository>();

        services.AddScoped<IGoalRepository, GoalRepository>();

        services.AddScoped<ICapabilityRepository, CapabilityRepository>();

        services.AddScoped<IReasoningSessionRepository, ReasoningSessionRepository>();

        services.AddScoped<IDecisionRepository, DecisionRepository>();

        return services;
    }
}
