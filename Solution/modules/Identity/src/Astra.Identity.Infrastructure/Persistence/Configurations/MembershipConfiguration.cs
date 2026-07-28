using Astra.Identity.Domain.Entities;
using Astra.Identity.Domain.ValueObjects;
using Astra.Organization.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Astra.Identity.Infrastructure.Persistence.Configurations;

public sealed class MembershipConfiguration : IEntityTypeConfiguration<Membership>
{
    public void Configure(EntityTypeBuilder<Membership> builder)
    {
        builder.ToTable("Memberships");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasConversion(
                id => id.Value,
                value => new Astra.Identity.Domain.ValueObjects.MembershipId(value))
            .ValueGeneratedNever();

        builder.Property(x => x.UserId)
            .HasConversion(
                id => id.Value,
                value => new UserId(value));

        builder.Property(x => x.OrganizationId)
            .HasConversion(
                id => id.Value,
                value => new OrganizationId(value));

        builder.Property(x => x.RoleId)
            .HasConversion(
                id => id.Value,
                value => new RoleId(value));

        builder.HasIndex(x => new
        {
            x.UserId,
            x.OrganizationId
        }).IsUnique();
    }
}