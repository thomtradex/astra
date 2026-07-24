using Astra.Planning.Domain.Entities;
using Astra.Planning.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Astra.Planning.Infrastructure.Persistence.Configurations;

public sealed class PlanStepConfiguration
    : IEntityTypeConfiguration<PlanStep>
{
    public void Configure(
        EntityTypeBuilder<PlanStep> builder)
    {
        builder.ToTable("plan_steps");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasConversion(
                x => x.Value,
                x => new PlanStepId(x));

        builder.Property(x => x.PlanId)
            .HasConversion(
                x => x.Value,
                x => new PlanId(x));

        builder.Property(x => x.Title)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Description)
            .HasMaxLength(4000)
            .IsRequired();

        builder.Property(x => x.Order)
            .IsRequired();

        builder.Property(x => x.Completed)
            .IsRequired();

        builder.HasIndex(x => new
        {
            x.PlanId,
            x.Order
        }).IsUnique();
    }
}