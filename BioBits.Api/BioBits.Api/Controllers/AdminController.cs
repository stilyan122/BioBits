using System.Security.Claims;
using BioBits.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BioBits.Api.Controllers
{
    [ApiController]
    [Route("api/admin")]                 // <-- literal route we call from the app
    [Authorize(Roles = "Admin")]         // must be Admin to access
    public sealed class AdminController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly UserManager<IdentityUser> _users;
        private readonly RoleManager<IdentityRole> _roles;

        public AdminController(AppDbContext db, UserManager<IdentityUser> users, RoleManager<IdentityRole> roles)
        {
            _db = db; _users = users; _roles = roles;
        }

        // Simple health check so we can verify routing
        [HttpGet("ping")]
        [AllowAnonymous] // optional: allow ping before auth
        public IActionResult Ping() => Ok(new { ok = true, at = DateTime.UtcNow });

        // ----- USERS -----
        public record AdminUserDto(string Id, string? Email, string? UserName, string[] Roles);

        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<AdminUserDto>>> ListUsers()
        {
            var list = await _users.Users
                .Select(u => new { u.Id, u.Email, u.UserName })
                .ToListAsync();

            var result = new List<AdminUserDto>(list.Count);
            foreach (var u in list)
            {
                var rs = await _users.GetRolesAsync(await _users.FindByIdAsync(u.Id));
                result.Add(new AdminUserDto(u.Id, u.Email, u.UserName, rs.ToArray()));
            }
            return Ok(result);
        }

        public record CreateUserDto(string Email, string Password, string Role); // Role: "Admin" | "Student"

        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest(new { message = "Email and password are required." });

            if (dto.Role is not ("Admin" or "Student"))
                return BadRequest(new { message = "Role must be Admin or Student." });

            var user = new IdentityUser { UserName = dto.Email, Email = dto.Email, EmailConfirmed = true };
            var r = await _users.CreateAsync(user, dto.Password);
            if (!r.Succeeded) return BadRequest(r.Errors);

            await _users.AddToRoleAsync(user, dto.Role);
            return Ok(new { message = "User created", id = user.Id });
        }

        [HttpPost("users/{id}/role")]
        public async Task<IActionResult> SetRole([FromRoute] string id, [FromBody] string role)
        {
            if (role is not ("Admin" or "Student"))
                return BadRequest(new { message = "Role must be Admin or Student." });

            var user = await _users.FindByIdAsync(id);
            if (user is null) return NotFound();

            var existing = await _users.GetRolesAsync(user);
            if (existing.Count > 0) await _users.RemoveFromRolesAsync(user, existing);
            await _users.AddToRoleAsync(user, role);
            return Ok(new { message = "Role updated" });
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser([FromRoute] string id)
        {
            var me = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (me == id) return BadRequest(new { message = "You cannot delete your own account." });

            var user = await _users.FindByIdAsync(id);
            if (user is null) return NotFound(new { message = "User not found." });

            var roles = await _users.GetRolesAsync(user);
            if (roles.Contains("Admin"))
            {
                var admins = await _users.GetUsersInRoleAsync("Admin");
                if (admins.Count <= 1)
                    return BadRequest(new { message = "You cannot delete the only Admin." });
            }

            var r = await _users.DeleteAsync(user);
            if (!r.Succeeded) return BadRequest(r.Errors);

            return Ok(new { message = "Deleted", id });
        }


        // ----- HISTORY -----
        [HttpGet("history/dna")]
        public async Task<IActionResult> ListDna([FromQuery] string? userId)
        {
            var q = _db.DnaOperations.AsNoTracking();
            if (!string.IsNullOrEmpty(userId)) q = q.Where(x => x.UserId == userId);
            var rows = await q.OrderByDescending(x => x.CreatedAt).Take(500).ToListAsync();
            return Ok(rows);
        }

        [HttpDelete("history/dna/{id:int}")]
        public async Task<IActionResult> DeleteDna([FromRoute] int id)
        {
            var row = await _db.DnaOperations.FindAsync(id);
            if (row is null) return NotFound();
            _db.DnaOperations.Remove(row);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Deleted" });
        }

        [HttpGet("history/quiz")]
        public async Task<IActionResult> ListQuiz([FromQuery] string? userId)
        {
            var q = _db.QuizResults.AsNoTracking();
            if (!string.IsNullOrEmpty(userId)) q = q.Where(x => x.UserId == userId);
            var rows = await q.OrderByDescending(x => x.CreatedAt).Take(500).ToListAsync();
            return Ok(rows);
        }

        [HttpDelete("history/quiz/{id:int}")]
        public async Task<IActionResult> DeleteQuiz([FromRoute] int id)
        {
            var row = await _db.QuizResults.FindAsync(id);
            if (row is null) return NotFound();
            _db.QuizResults.Remove(row);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Deleted" });
        }

        // ----- STATS -----
        public record AdminStatsDto(int Users, int DnaCount, int QuizCount, int Active7, double AvgQuizTime);

        [HttpGet("stats")]
        public async Task<IActionResult> Stats()
        {
            var users = await _users.Users.CountAsync();
            var dnaCount = await _db.DnaOperations.CountAsync();
            var quizCount = await _db.QuizResults.CountAsync();

            var since = DateTime.UtcNow.AddDays(-7);
            var activeUserIds = await _db.DnaOperations.Where(x => x.CreatedAt >= since).Select(x => x.UserId)
                .Concat(_db.QuizResults.Where(x => x.CreatedAt >= since).Select(x => x.UserId))
                .Distinct().CountAsync();

            double avgQuizTime = 0;
            var any = await _db.QuizResults.AnyAsync();
            if (any) avgQuizTime = await _db.QuizResults.AverageAsync(x => (double)x.AvgMs);

            return Ok(new AdminStatsDto(users, dnaCount, quizCount, activeUserIds, avgQuizTime));
        }
    }
}
