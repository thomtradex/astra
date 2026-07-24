using Astra.Identity.Application.Authentication.Login;
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

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var response = await _sender.Send(
            new LoginCommand(
                request.Email,
                request.Password),
            cancellationToken);

        return Ok(response);
    }
}