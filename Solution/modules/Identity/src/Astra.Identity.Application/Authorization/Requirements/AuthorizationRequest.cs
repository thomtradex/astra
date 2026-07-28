namespace Astra.Identity.Application.Authorization.Requirements;

public sealed record AuthorizationRequest(
    Guid UserId,
    Guid OrganizationId,
    string Policy);