using Astra.Memory.Domain.Entities;
using Astra.Memory.Domain.ValueObjects;
using Astra.Organization.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Astra.Memory.Infrastructure.Persistence.Configurations;

public sealed class MemoryCollectionConfiguration
    : IEntityTypeConfiguration<MemoryCollection>
{
    public void Configure(
        EntityTypeBuilder<MemoryCollection> builder)
    {
        builder.ToTable("memory_collections");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasConversion(
                x => x.Value,
                x => new MemoryCollectionId(x));

        builder.Property(x => x.OrganizationId)
            .HasConversion(
                x => x.Value,
                x => new OrganizationId(x));

        builder.Property(x => x.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Description)
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(x => x.CreatedAtUtc)
            .IsRequired();

        builder.HasIndex(x => x.OrganizationId);
    }
}