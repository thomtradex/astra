using Microsoft.Extensions.DependencyInjection;

namespace Astra.Workflow.Application.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(
        this IServiceCollection services)
    {
        return services;
    }
}