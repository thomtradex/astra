using Astra.Workflow.Domain.Repositories;
using Astra.Workflow.Infrastructure.Persistence;
using Astra.Workflow.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Astra.Workflow.Infrastructure.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<WorkflowDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("WorkflowDatabase")));

        services.AddScoped<IWorkflowRepository, WorkflowRepository>();

        return services;
    }
}