using Astra.Organization.Domain.ValueObjects;

namespace Astra.Organization.Application.Commands.DeleteOrganization;

public sealed record DeleteOrganizationCommand(
    OrganizationId Id);