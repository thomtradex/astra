using Astra.Identity.Application.Authorization.Interfaces;
using Astra.Identity.Application.Authorization.Services;
using Astra.Identity.Application.Behaviors;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace Astra.Identity.Application.DependencyInjection;

public static class ApplicationRegistration
{
    public static IServiceCollection AddApplication(
        this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(
                typeof(ApplicationRegistration).Assembly);
        });

        services.AddValidatorsFromAssembly(
            typeof(ApplicationRegistration).Assembly);

        services.AddTransient(
            typeof(IPipelineBehavior<,>),
            typeof(ValidationBehavior<,>));

        services.AddSingleton<PolicyEvaluator>();

        services.AddScoped<IAuthorizationService, AuthorizationService>();

        return services;
    }
}