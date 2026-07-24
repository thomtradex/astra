using Microsoft.Extensions.DependencyInjection;

namespace Astra.SharedKernel.Application.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection AddSharedKernelApplication(
        this IServiceCollection services)
    {
        return services;
    }
}