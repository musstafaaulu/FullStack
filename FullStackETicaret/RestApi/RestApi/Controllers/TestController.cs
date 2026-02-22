using Microsoft.AspNetCore.Mvc;
using RestApi.Common;

namespace RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    [HttpGet("ping")]
    public ActionResult<ApiResponse<object>> Ping()
    {
        // Ok yerine SuccessResponse kullanıyoruz
        return Ok(ApiResponse<object>.SuccessResponse(new { time = DateTime.UtcNow }, "pong"));
    }

    [HttpGet("crash")]
    public IActionResult Crash()
    {
        throw new Exception("Test exception");
    }
}