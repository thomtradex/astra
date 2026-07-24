namespace Astra.Organization.Application.Commands.CreateOrganization;

public sealed record CreateOrganizationCommand(
    string Name,
    string Slug
);