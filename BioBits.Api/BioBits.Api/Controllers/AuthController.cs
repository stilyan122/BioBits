using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace BioBits.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly IConfiguration _config;
        private readonly RoleManager<IdentityRole> _roleManager;

        public class RegisterRequest
        {
            public string Email { get; set; } = default!;
            public string Password { get; set; } = default!;
            public string? Role { get; set; }
        }

        public AuthController(
            UserManager<IdentityUser> userManager,
            SignInManager<IdentityUser> signInManager,
            IConfiguration config,
            RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _config = config;
            _roleManager = roleManager;
        }

        public record LoginDto(string Email, string Password);
        public record RegisterDto(string Email, string Password, string? Role);

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);

            if (user == null)
                return Unauthorized("Invalid credentials");

            var passOk = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);

            if (!passOk.Succeeded)
                return Unauthorized("Invalid credentials");

            var roles = await _userManager.GetRolesAsync(user);
            var token = GenerateJwt(user, roles);

            return Ok(new
            {
                token,
                user = user.Email,
                roles
            });
        }

        [HttpPost("register")]
        [AllowAnonymous] 
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
            var role = (req.Role ?? "Student").Trim();

            if (!string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(role, "Student", StringComparison.OrdinalIgnoreCase))
            {
                role = "Student";
            }

            var user = new IdentityUser 
            { 
                UserName = req.Email, 
                Email = req.Email, 
                EmailConfirmed = true };

            var createRes = await _userManager.CreateAsync(user, req.Password);

            if (!createRes.Succeeded) 
                return BadRequest(createRes.Errors);

            await _userManager.AddToRoleAsync(user, role);

            return Ok(new { message = "User created", user = req.Email, role });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                user = user.Email,
                roles
            });
        }

        private string GenerateJwt(IdentityUser user, IList<string> roles)
        {
            var issuer = _config["Jwt:Issuer"]!;
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id),
                new(ClaimTypes.Name, user.UserName ?? user.Email ?? ""),
                new(JwtRegisteredClaimNames.Sub, user.Id),
            };

            foreach (var r in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, r));
            }

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: null,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(6),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}