using Astra.SharedKernel.Domain.Entities;

namespace Astra.CompanyBrain.Domain.Entities;

public sealed class Decision : Entity<Guid>
{
    private Decision()
    {
    }

    public Decision(
        Guid id,
        string prompt,
        string outcome,
        double confidence)
    {
        Id = id;
        Prompt = prompt;
        Outcome = outcome;
        Confidence = confidence;
        CreatedAt = DateTime.UtcNow;
    }

    public string Prompt { get; private set; } = string.Empty;

    public string Outcome { get; private set; } = string.Empty;

    public double Confidence { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public void UpdateOutcome(
        string outcome,
        double confidence)
    {
        Outcome = outcome;
        Confidence = confidence;
    }
}