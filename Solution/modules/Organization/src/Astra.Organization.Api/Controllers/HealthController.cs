using Microsoft.AspNetCore.Mvc;

namespace Astra.Organization.Api.Controllers;

[ApiController]
[Route("organization/health")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            Service = "Organization",
            Status = "Healthy"
        });
    }
}