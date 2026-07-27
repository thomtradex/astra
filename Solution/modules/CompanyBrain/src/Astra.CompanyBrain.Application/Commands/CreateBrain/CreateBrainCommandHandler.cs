using Astra.CompanyBrain.Domain.Entities;
using Astra.CompanyBrain.Domain.Repositories;
using Astra.CompanyBrain.Domain.ValueObjects;

namespace Astra.CompanyBrain.Application.Commands.CreateBrain;

public sealed class CreateBrainCommandHandler
{
    private readonly IBrainRepository _repository;

    public CreateBrainCommandHandler(
        IBrainRepository repository)
    {
        _repository = repository;
    }

    public async Task<BrainId> Handle(
        CreateBrainCommand command,
        CancellationToken cancellationToken)
    {
        var brain = new Brain(
            BrainId.New(),
            command.Name);

        await _repository.AddAsync(
            brain,
            cancellationToken);

        await _repository.SaveChangesAsync(
            cancellationToken);

        return brain.Id;
    }
}
