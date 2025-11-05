using Microsoft.AspNetCore.Mvc;

namespace BioBits.Api.Controllers
{
    public class AdminController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
