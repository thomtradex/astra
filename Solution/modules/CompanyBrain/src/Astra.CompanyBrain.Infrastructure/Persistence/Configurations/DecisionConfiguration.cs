using Astra.CompanyBrain.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Astra.CompanyBrain.Infrastructure.Persistence.Configurations;

public sealed class DecisionConfiguration
    : IEntityTypeConfiguration<Decision>
{
    public void Configure(
        EntityTypeBuilder<Decision> builder)
    {
        builder.ToTable("Decisions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnType("uuid")
            .ValueGeneratedNever();

        builder.Property(x => x.Prompt)
            .HasMaxLength(4000)
            .IsRequired();

        builder.Property(x => x.Outcome)
            .HasMaxLength(4000)
            .IsRequired();

        builder.Property(x => x.Confidence)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();
    }
}