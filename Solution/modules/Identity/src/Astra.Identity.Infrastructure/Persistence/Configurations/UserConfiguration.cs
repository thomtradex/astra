using Astra.Identity.Domain.Entities;
using Astra.Identity.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Astra.Identity.Infrastructure.Persistence.Configurations;

public sealed class UserConfiguration
    : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasConversion(
                id => id.Value,
                value => new UserId(value))
            .ValueGeneratedNever();

        builder.Property(x => x.Name)
            .HasColumnName("FullName")
            .HasMaxLength(200)
            .IsRequired();

        builder.OwnsOne(
            x => x.Email,
            email =>
            {
                email.Property(x => x.Value)
                    .HasColumnName("Email")
                    .HasMaxLength(320)
                    .IsRequired();
            });

        builder.OwnsOne(
            x => x.PasswordHash,
            password =>
            {
                password.Property(x => x.Value)
                    .HasColumnName("PasswordHash")
                    .IsRequired();
            });

        builder.Property(x => x.Status)
            .HasColumnName("Status")
            .HasConversion<string>();
    }
}