using Astra.SharedKernel.Domain.Entities;

namespace Astra.SharedKernel.Domain.Exceptions;

public sealed class BusinessRuleValidationException
    : DomainException
{
    public BusinessRuleValidationException(
        IBusinessRule rule)
        : base(rule.Message)
    {
    }
}