using Astra.Organization.Domain.ValueObjects;

namespace Astra.Organization.Application.Commands.UpdateOrganization;

public sealed record UpdateOrganizationCommand(
    OrganizationId Id,
    string Name,
    string Slug);