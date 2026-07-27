using Astra.CompanyBrain.Domain.Entities;
using Astra.CompanyBrain.Domain.Repositories;
using Astra.CompanyBrain.Domain.ValueObjects;

namespace Astra.CompanyBrain.Application.Commands.CreateGoal;

public sealed class CreateGoalCommandHandler
{
    private readonly IGoalRepository _repository;

    public CreateGoalCommandHandler(
        IGoalRepository repository)
    {
        _repository = repository;
    }

    public async Task<GoalId> Handle(
        CreateGoalCommand command,
        CancellationToken cancellationToken)
    {
        var goal = new Goal(
            GoalId.New(),
            command.Title,
            command.Description);

        await _repository.AddAsync(
            goal,
            cancellationToken);

        await _repository.SaveChangesAsync(
            cancellationToken);

        return goal.Id;
    }
}
