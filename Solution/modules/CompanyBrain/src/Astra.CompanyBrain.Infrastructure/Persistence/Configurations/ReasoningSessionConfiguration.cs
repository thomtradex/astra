using Astra.CompanyBrain.Domain.Entities;
using Astra.CompanyBrain.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Astra.CompanyBrain.Infrastructure.Persistence.Configurations;

public sealed class ReasoningSessionConfiguration
    : IEntityTypeConfiguration<ReasoningSession>
{
    public void Configure(
        EntityTypeBuilder<ReasoningSession> builder)
    {
        builder.ToTable("ReasoningSessions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasConversion(
                id => id.Value,
                value => new ReasoningSessionId(value))
            .HasColumnType("uuid")
            .ValueGeneratedNever();

        builder.Property(x => x.Title)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.StartedAt)
            .IsRequired();

        builder.Property(x => x.FinishedAt);
    }
}