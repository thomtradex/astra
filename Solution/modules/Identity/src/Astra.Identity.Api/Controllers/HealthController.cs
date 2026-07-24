using Microsoft.AspNetCore.Mvc;

namespace Astra.Identity.Api.Controllers;

[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok("Identity OK");
    }
}