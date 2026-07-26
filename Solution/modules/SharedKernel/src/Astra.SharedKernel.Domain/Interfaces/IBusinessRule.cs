namespace Astra.SharedKernel.Domain.Interfaces;

public interface IBusinessRule
{
    bool IsBroken();

    string Message { get; }
}