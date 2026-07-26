using Astra.CompanyBrain.Domain.Entities;
using Astra.CompanyBrain.Domain.ValueObjects;

namespace Astra.CompanyBrain.Domain.Repositories;

public interface ICapabilityRepository
{
    Task<Capability?> GetByIdAsync(
        CapabilityId id,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        Capability capability,
        CancellationToken cancellationToken = default);

    Task UpdateAsync(
        Capability capability,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Capability capability,
        CancellationToken cancellationToken = default);
}