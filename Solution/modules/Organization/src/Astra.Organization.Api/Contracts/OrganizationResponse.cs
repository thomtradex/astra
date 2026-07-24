namespace Astra.Organization.Api.Contracts;

public sealed record OrganizationResponse(
    Guid Id,
    string Name,
    string Slug);