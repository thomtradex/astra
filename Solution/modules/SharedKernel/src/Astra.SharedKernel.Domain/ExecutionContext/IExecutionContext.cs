namespace Astra.SharedKernel.Domain.ExecutionContext;

public interface IExecutionContext
{
    Guid UserId { get; }

    Guid TenantId { get; }

    string UserName { get; }

    string Email { get; }

    bool IsAuthenticated { get; }
}