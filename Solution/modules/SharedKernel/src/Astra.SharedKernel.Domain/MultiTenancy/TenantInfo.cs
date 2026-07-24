namespace Astra.SharedKernel.Domain.MultiTenancy;

public sealed record TenantInfo(
    Guid TenantId,
    string TenantName);