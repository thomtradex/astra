namespace Astra.SharedKernel.Application.Interfaces;

public interface ICurrentTenant
{
    Guid TenantId { get; }

    string Name { get; }

    bool IsAvailable { get; }
}