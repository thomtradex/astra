namespace Astra.SharedKernel.Domain.Configuration;

public sealed record ConfigurationKey(
    string Value)
{
    public override string ToString()
        => Value;
}