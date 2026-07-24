using Astra.SharedKernel.Infrastructure.Email;
using Astra.SharedKernel.Infrastructure.Storage;
using Astra.SharedKernel.Infrastructure.Cache;
using Astra.SharedKernel.Application.Interfaces;
using Astra.SharedKernel.Application.Mediator;
using Microsoft.Extensions.DependencyInjection;

namespace Astra.SharedKernel.Infrastructure.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection AddSharedKernelInfrastructure(
        this IServiceCollection services)
    {
        services.AddMemoryCache();

        services.AddSingleton<IEmailSender, EmailSender>();
        
        services.AddSingleton<IFileStorage, LocalFileStorage>();
        
        services.AddSingleton<ICacheService, MemoryCacheService>();
       
        services.AddScoped<IMediator, Astra.SharedKernel.Infrastructure.Mediator.Mediator>();

        services.AddScoped<IDomainEventDispatcher, Astra.SharedKernel.Infrastructure.Events.DomainEventDispatcher>();

        services.AddScoped<IUnitOfWork, Astra.SharedKernel.Infrastructure.UnitOfWork.UnitOfWork>();

        services.AddSingleton<IClock, Astra.SharedKernel.Infrastructure.Clock.SystemClock>();

        services.AddSingleton<IGuidGenerator, Astra.SharedKernel.Infrastructure.Ids.GuidGenerator>();

        return services;
    }
}