using Astra.Identity.Application.Abstractions;
using Astra.Identity.Domain.Repositories;
using Astra.Identity.Infrastructure.Options;
using Astra.Identity.Infrastructure.Persistence;
using Astra.Identity.Infrastructure.Persistence.Repositories;
using Astra.Identity.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Astra.Identity.Infrastructure.DependencyInjection;

public static class InfrastructureRegistration
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<JwtOptions>(
            configuration.GetSection(
                JwtOptions.SectionName));

        services.AddDbContext<IdentityDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString(
                    "IdentityDatabase")));

        services.AddScoped<IUserRepository, UserRepository>();

        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        
        services.AddSingleton<
            IPasswordHasher,
            PasswordHasher>();

        services.AddSingleton<
            ITokenProvider,
            JwtTokenProvider>();

        return services;
    }
}