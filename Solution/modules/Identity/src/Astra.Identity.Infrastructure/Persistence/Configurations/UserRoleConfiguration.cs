using Astra.Identity.Domain.Entities;
using Astra.Identity.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Astra.Identity.Infrastructure.Persistence.Configurations;

public sealed class UserRoleConfiguration
    : IEntityTypeConfiguration<UserRole>
{
    public void Configure(
        EntityTypeBuilder<UserRole> builder)
    {
        builder.ToTable("user_roles");


        builder.HasKey(x => x.Id);


        builder.Property(x => x.Id)
            .HasConversion(
                id => id.Value,
                value => new UserRoleId(value));


        builder.Property(x => x.UserId)
            .HasConversion(
                id => id.Value,
                value => new UserId(value))
            .IsRequired();


        builder.Property(x => x.RoleId)
            .HasConversion(
                id => id.Value,
                value => new RoleId(value))
            .IsRequired();



        builder.HasOne<User>()
            .WithMany(x => x.UserRoles)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);



        builder.HasOne<Role>()
            .WithMany()
            .HasForeignKey(x => x.RoleId)
            .OnDelete(DeleteBehavior.Cascade);



        builder.HasIndex(x => new
        {
            x.UserId,
            x.RoleId
        })
        .IsUnique();
    }
}