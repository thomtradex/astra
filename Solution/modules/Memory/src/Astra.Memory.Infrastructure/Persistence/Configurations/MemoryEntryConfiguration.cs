using Astra.Memory.Domain.Entities;
using Astra.Memory.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Astra.Memory.Infrastructure.Persistence.Configurations;

public sealed class MemoryEntryConfiguration
    : IEntityTypeConfiguration<MemoryEntry>
{
    public void Configure(
        EntityTypeBuilder<MemoryEntry> builder)
    {
        builder.ToTable("memory_entries");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasConversion(
                x => x.Value,
                x => new MemoryEntryId(x));

        builder.Property(x => x.MemoryCollectionId)
            .HasConversion(
                x => x.Value,
                x => new MemoryCollectionId(x));

        builder.Property(x => x.Key)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Value)
            .IsRequired();

        builder.Property(x => x.EmbeddingId)
            .HasMaxLength(200);

        builder.Property(x => x.CreatedAtUtc)
            .IsRequired();

        builder.HasIndex(x => new
        {
            x.MemoryCollectionId,
            x.Key
        }).IsUnique();
    }
}