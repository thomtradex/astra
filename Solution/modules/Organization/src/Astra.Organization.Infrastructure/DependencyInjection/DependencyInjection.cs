using Astra.Organization.Domain.Repositories;
using Astra.Organization.Infrastructure.Persistence;
using Astra.Organization.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Astra.Organization.Infrastructure.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<OrganizationDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("Organization")));

        services.AddScoped<
            IOrganizationRepository,
            OrganizationRepository>();

        services.AddScoped<
            IWorkspaceRepository,
            WorkspaceRepository>();

        services.AddScoped<
            IMembershipRepository,
            MembershipRepository>();

        return services;
    }
}