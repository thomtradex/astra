using System.ComponentModel.DataAnnotations;
using Astra.Identity.Domain.Exceptions;
using Microsoft.AspNetCore.Diagnostics;

namespace Astra.Identity.Api.Exceptions;

public sealed class GlobalExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        httpContext.Response.ContentType = "application/json";

        switch (exception)
        {
            case UnauthorizedAccessException:
            case InvalidCredentialsException:
                httpContext.Response.StatusCode = StatusCodes.Status401Unauthorized;
                break;

            case UserNotFoundException:
                httpContext.Response.StatusCode = StatusCodes.Status404NotFound;
                break;

            case DuplicateEmailException:
                httpContext.Response.StatusCode = StatusCodes.Status409Conflict;
                break;

            case ValidationException:
                httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
                break;

            default:
                httpContext.Response.StatusCode =
                    StatusCodes.Status500InternalServerError;
                break;
        }

        await httpContext.Response.WriteAsJsonAsync(
            new
            {
                error = exception.Message
            },
            cancellationToken);

        return true;
    }
}