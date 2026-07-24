namespace Astra.SharedKernel.Domain.ExecutionContext;

public sealed record ExecutionContextInfo(
    Guid UserId,
    Guid TenantId,
    string UserName,
    string Email,
    bool IsAuthenticated);