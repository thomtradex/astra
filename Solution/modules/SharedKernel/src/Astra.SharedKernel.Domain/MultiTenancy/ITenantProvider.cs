namespace Astra.SharedKernel.Domain.MultiTenancy;

public interface ITenantProvider
{
    Guid TenantId { get; }

    string TenantName { get; }

    bool HasTenant { get; }
}