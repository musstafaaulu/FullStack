using Microsoft.AspNetCore.Mvc;

namespace Nexus.API.Controllers
{
    public class TenantBaseController : ControllerBase
    {
        protected int GetCompanyId()
        {
            // Önce X-Company-Id header'ına bak
            if (Request.Headers.TryGetValue("X-Company-Id", out var headerValue) &&
                int.TryParse(headerValue, out int headerCompanyId) &&
                headerCompanyId > 0)
            {
                return headerCompanyId;
            }

            // Sonra JWT claim'e bak
            var claim = User.Claims.FirstOrDefault(c => c.Type == "CompanyId");
            if (claim != null && int.TryParse(claim.Value, out int jwtCompanyId) && jwtCompanyId > 0)
                return jwtCompanyId;

            return 0;
        }

        protected int GetUserId()
        {
            var claim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier);
            if (claim == null || !int.TryParse(claim.Value, out int userId))
                return 0;
            return userId;
        }
    }
}