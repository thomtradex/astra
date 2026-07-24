using Astra.Organization.Application.Commands.CreateOrganization;
using Astra.Organization.Application.Commands.DeleteOrganization;
using Astra.Organization.Application.Commands.UpdateOrganization;
using Astra.Organization.Application.Queries.GetOrganizationById;
using Microsoft.Extensions.DependencyInjection;

namespace Astra.Organization.Application.DependencyInjection;

public static class ApplicationDependencyInjection
{
    public static IServiceCollection AddApplication(
        this IServiceCollection services)
    {
        services.AddScoped<CreateOrganizationCommandHandler>();

        services.AddScoped<UpdateOrganizationCommandHandler>();

        services.AddScoped<DeleteOrganizationCommandHandler>();

        services.AddScoped<GetOrganizationByIdQueryHandler>();

        return services;
    }
}