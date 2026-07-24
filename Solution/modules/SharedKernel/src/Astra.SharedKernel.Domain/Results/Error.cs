namespace Astra.SharedKernel.Domain.Results;

public sealed record Error(
    string Code,
    string Description)
{
    public static readonly Error None = new("", "");
}