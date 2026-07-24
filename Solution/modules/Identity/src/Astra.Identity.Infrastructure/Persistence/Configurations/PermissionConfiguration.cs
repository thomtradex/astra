using Astra.Identity.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Astra.Identity.Infrastructure.Persistence.Configurations;

public sealed class PermissionConfiguration
    : IEntityTypeConfiguration<Permission>
{
    public void Configure(
        EntityTypeBuilder<Permission> builder)
    {
        builder.ToTable("permissions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id);

        builder.OwnsOne(
            x => x.Name,
            name =>
            {
                name.Property(x => x.Value)
                    .HasColumnName("name")
                    .HasMaxLength(100)
                    .IsRequired();
            });

        builder.Property(x => x.Description)
            .HasMaxLength(500)
            .IsRequired();
    }
}