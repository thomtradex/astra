namespace Astra.SharedKernel.Domain.Validation;

public sealed record ValidationError(
    string Property,
    string Message);