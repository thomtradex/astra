using Astra.Agents.Domain.Entities;
using Astra.Agents.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Astra.Agents.Infrastructure.Persistence.Configurations;

public sealed class AgentCapabilityConfiguration
    : IEntityTypeConfiguration<AgentCapability>
{
    public void Configure(EntityTypeBuilder<AgentCapability> builder)
    {
        builder.ToTable("agent_capabilities");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasConversion(x => x.Value, x => new AgentCapabilityId(x));

        builder.Property(x => x.AgentId)
            .HasConversion(x => x.Value, x => new AgentId(x));

        builder.Property(x => x.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Description)
            .HasMaxLength(2000)
            .IsRequired();

        builder.HasIndex(x => x.AgentId);
    }
}