using Astra.Organization.Domain.ValueObjects;
using Astra.Planning.Domain.Entities;
using Astra.Planning.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Astra.Planning.Infrastructure.Persistence.Configurations;

public sealed class PlanConfiguration
    : IEntityTypeConfiguration<Plan>
{
    public void Configure(
        EntityTypeBuilder<Plan> builder)
    {
        builder.ToTable("plans");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasConversion(
                x => x.Value,
                x => new PlanId(x));

        builder.Property(x => x.OrganizationId)
            .HasConversion(
                x => x.Value,
                x => new OrganizationId(x));

        builder.Property(x => x.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Goal)
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(x => x.CreatedAtUtc)
            .IsRequired();

        builder.HasIndex(x => x.OrganizationId);
    }
}