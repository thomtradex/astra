using Astra.Organization.Domain.Entities;
using Astra.Organization.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Astra.Organization.Infrastructure.Persistence.Configurations;

public sealed class MembershipConfiguration
    : IEntityTypeConfiguration<Membership>
{
    public void Configure(
        EntityTypeBuilder<Membership> builder)
    {
        builder.ToTable("Memberships");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasConversion(
                id => id.Value,
                value => new MembershipId(value))
            .HasColumnType("uuid")
            .ValueGeneratedNever();

        builder.Property(x => x.OrganizationId)
            .HasConversion(
                id => id.Value,
                value => new OrganizationId(value))
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(x => x.UserId)
            .HasColumnType("uuid")
            .IsRequired();

        builder.Property(x => x.Role)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.JoinedAtUtc)
            .IsRequired();

        builder.HasIndex(x => new
        {
            x.OrganizationId,
            x.UserId
        })
        .IsUnique();

        builder.HasOne<Astra.Organization.Domain.Entities.Organization>()
            .WithMany()
            .HasForeignKey(x => x.OrganizationId)
            .HasPrincipalKey(x => x.Id)
            .OnDelete(DeleteBehavior.Cascade);
    }
}