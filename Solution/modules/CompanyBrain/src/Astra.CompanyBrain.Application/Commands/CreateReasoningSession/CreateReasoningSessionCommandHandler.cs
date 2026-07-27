using Astra.CompanyBrain.Domain.Entities;
using Astra.CompanyBrain.Domain.Repositories;
using Astra.CompanyBrain.Domain.ValueObjects;

namespace Astra.CompanyBrain.Application.Commands.CreateReasoningSession;

public sealed class CreateReasoningSessionCommandHandler
{
    private readonly IReasoningSessionRepository _repository;

    public CreateReasoningSessionCommandHandler(
        IReasoningSessionRepository repository)
    {
        _repository = repository;
    }

    public async Task<ReasoningSessionId> Handle(
        CreateReasoningSessionCommand command,
        CancellationToken cancellationToken)
    {
        var session = new ReasoningSession(
            ReasoningSessionId.New(),
            command.Title);

        await _repository.AddAsync(
            session,
            cancellationToken);

        await _repository.SaveChangesAsync(
            cancellationToken);

        return session.Id;
    }
}
