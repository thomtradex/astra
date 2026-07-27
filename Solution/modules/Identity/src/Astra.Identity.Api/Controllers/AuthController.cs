using Astra.Identity.Application.Authentication.Login;
using Astra.Identity.Application.Authentication.Logout;
using Astra.Identity.Application.Authentication.Refresh;
using Astra.Identity.Application.Commands;
using Astra.Identity.Contracts.Requests;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Astra.Identity.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly ISender _sender;

    public AuthController(
        ISender sender)
    {
        _sender = sender;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(
        CreateUserRequest request,
        CancellationToken cancellationToken)
    {
        await _sender.Send(
            new RegisterUserCommand(
                request.Email,
                request.Name,
                request.Password),
            cancellationToken);

        return NoContent();
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var response =
            await _sender.Send(
                new LoginCommand(
                    request.Email,
                    request.Password),
                cancellationToken);

        return Ok(response);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(
        RefreshTokenRequest request,
        CancellationToken cancellationToken)
    {
        var response =
            await _sender.Send(
                new RefreshTokenCommand(
                    request.RefreshToken),
                cancellationToken);

        return Ok(response);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(
        LogoutRequest request,
        CancellationToken cancellationToken)
    {
        await _sender.Send(
            new LogoutCommand(
                request.RefreshToken),
            cancellationToken);

        return NoContent();
    }
}