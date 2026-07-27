using Astra.CompanyBrain.Domain.Entities;
using Astra.CompanyBrain.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Astra.CompanyBrain.Infrastructure.Persistence.Configurations;

public sealed class BrainConfiguration
    : IEntityTypeConfiguration<Brain>
{
    public void Configure(
        EntityTypeBuilder<Brain> builder)
    {
        builder.ToTable("Brains");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasConversion(
                id => id.Value,
                value => new BrainId(value))
            .HasColumnType("uuid")
            .ValueGeneratedNever();

        builder.Property(x => x.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();
    }
}