using Astra.Identity.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Astra.Identity.Infrastructure.Persistence.Configurations;

public sealed class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("roles");

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

        builder.Property(x => x.Type)
            .IsRequired();
    }
}