namespace Astra.Organization.Api.Contracts;

public sealed record CreateOrganizationRequest(
    string Name,
    string Slug);