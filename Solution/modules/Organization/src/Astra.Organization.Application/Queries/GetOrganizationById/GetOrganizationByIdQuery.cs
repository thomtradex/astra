using Astra.Organization.Domain.ValueObjects;

namespace Astra.Organization.Application.Queries.GetOrganizationById;

public sealed record GetOrganizationByIdQuery(
    OrganizationId Id);