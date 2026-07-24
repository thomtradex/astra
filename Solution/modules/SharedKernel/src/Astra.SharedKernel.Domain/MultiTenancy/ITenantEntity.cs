namespace Astra.SharedKernel.Domain.MultiTenancy;

public interface ITenantEntity
{
    Guid TenantId { get; }
}