using Microsoft.EntityFrameworkCore;

namespace Astra.SharedKernel.Infrastructure.Persistence.Configurations;

public static class ModelBuilderExtensions
{
    public static ModelBuilder ApplySharedConfigurations(
        this ModelBuilder modelBuilder)
    {
        return modelBuilder;
    }
}