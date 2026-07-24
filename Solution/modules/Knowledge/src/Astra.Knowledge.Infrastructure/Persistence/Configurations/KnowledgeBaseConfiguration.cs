using Astra.Knowledge.Domain.Entities;
using Astra.Knowledge.Domain.ValueObjects;
using Astra.Organization.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Astra.Knowledge.Infrastructure.Persistence.Configurations;

public sealed class KnowledgeBaseConfiguration
    : IEntityTypeConfiguration<KnowledgeBase>
{
    public void Configure(
        EntityTypeBuilder<KnowledgeBase> builder)
    {
        builder.ToTable("knowledge_bases");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasConversion(
                x => x.Value,
                x => new KnowledgeBaseId(x));

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