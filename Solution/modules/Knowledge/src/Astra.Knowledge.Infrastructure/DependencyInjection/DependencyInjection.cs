using Astra.Knowledge.Domain.Repositories;
using Astra.Knowledge.Infrastructure.Persistence;
using Astra.Knowledge.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Astra.Knowledge.Infrastructure.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<KnowledgeDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("Knowledge")));

        services.AddScoped<
            IKnowledgeBaseRepository,
            KnowledgeBaseRepository>();

        services.AddScoped<
            IDocumentRepository,
            DocumentRepository>();

        services.AddScoped<
            IDocumentChunkRepository,
            DocumentChunkRepository>();

        return services;
    }
}