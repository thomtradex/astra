using Astra.CompanyBrain.Application.Commands.CreateBrain;
using Astra.CompanyBrain.Application.Commands.CreateCapability;
using Astra.CompanyBrain.Application.Commands.CreateGoal;
using Astra.CompanyBrain.Application.Commands.CreateReasoningSession;
using Astra.CompanyBrain.Application.Queries.GetBrainById;
using Microsoft.Extensions.DependencyInjection;

namespace Astra.CompanyBrain.Application.DependencyInjection;

public static class ApplicationDependencyInjection
{
    public static IServiceCollection AddApplication(
        this IServiceCollection services)
    {
        services.AddScoped<CreateBrainCommandHandler>();

        services.AddScoped<CreateGoalCommandHandler>();

        services.AddScoped<CreateCapabilityCommandHandler>();

        services.AddScoped<CreateReasoningSessionCommandHandler>();

        services.AddScoped<GetBrainByIdQueryHandler>();

        return services;
    }
}
