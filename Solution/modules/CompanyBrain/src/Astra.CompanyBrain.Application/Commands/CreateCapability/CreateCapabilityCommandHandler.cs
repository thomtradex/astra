using Astra.CompanyBrain.Domain.Entities;
using Astra.CompanyBrain.Domain.Repositories;
using Astra.CompanyBrain.Domain.ValueObjects;

namespace Astra.CompanyBrain.Application.Commands.CreateCapability;

public sealed class CreateCapabilityCommandHandler
{
    private readonly ICapabilityRepository _repository;

    public CreateCapabilityCommandHandler(
        ICapabilityRepository repository)
    {
        _repository = repository;
    }

    public async Task<CapabilityId> Handle(
        CreateCapabilityCommand command,
        CancellationToken cancellationToken)
    {
        var capability = new Capability(
            CapabilityId.New(),
            command.Name,
            command.Description);

        await _repository.AddAsync(
            capability,
            cancellationToken);

        await _repository.SaveChangesAsync(
            cancellationToken);

        return capability.Id;
    }
}
