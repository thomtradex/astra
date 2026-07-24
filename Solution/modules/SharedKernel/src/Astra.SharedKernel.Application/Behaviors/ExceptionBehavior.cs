using Astra.SharedKernel.Application.Mediator;

namespace Astra.SharedKernel.Application.Behaviors;

public sealed class ExceptionBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
{
    public async Task<TResponse> Handle(
        TRequest request,
        CancellationToken cancellationToken,
        RequestHandlerDelegate<TResponse> next)
    {
        try
        {
            return await next();
        }
        catch
        {
            throw;
        }
    }
}