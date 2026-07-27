using Astra.CompanyBrain.Domain.Entities;
using Astra.CompanyBrain.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Astra.CompanyBrain.Infrastructure.Persistence.Configurations;

public sealed class CapabilityConfiguration
    : IEntityTypeConfiguration<Capability>
{
    public void Configure(
        EntityTypeBuilder<Capability> builder)
    {
        builder.ToTable("Capabilities");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasConversion(
                id => id.Value,
                value => new CapabilityId(value))
            .HasColumnType("uuid")
            .ValueGeneratedNever();

        builder.Property(x => x.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Description)
            .HasMaxLength(4000)
            .IsRequired();

        builder.Property(x => x.IsEnabled)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();
    }
}