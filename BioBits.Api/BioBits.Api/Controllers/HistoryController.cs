using System.Security.Claims;
using BioBits.Api.Data;
using BioBits.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BioBits.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] 
    public class HistoryController : ControllerBase
    {
        private readonly AppDbContext _db;

        public HistoryController(AppDbContext db)
        {
            _db = db;
        }

        [HttpPost("dna")]
        public async Task<IActionResult> LogDna([FromBody] DnaLogDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var op = new DnaOperation
            {
                UserId = userId,
                Type = dto.Type,
                Input = dto.Input,
                Output = dto.Output,
                MetaJson = dto.MetaJson,
            };

            _db.DnaOperations.Add(op);
            await _db.SaveChangesAsync();

            return Ok(new { id = op.Id, at = op.CreatedAt });
        }

        [HttpGet("dna")]
        public async Task<IActionResult> GetMyDna()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var list = await _db.DnaOperations
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreatedAt)
                .Take(100)
                .ToListAsync();

            return Ok(list);
        }

        [HttpPost("quiz")]
        public async Task<IActionResult> LogQuiz([FromBody] QuizLogDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var qr = new QuizResult
            {
                UserId = userId,
                Score = dto.Score,
                Total = dto.Total,
                AvgMs = dto.AvgMs,
                Kind = dto.Kind,
            };

            _db.QuizResults.Add(qr);
            await _db.SaveChangesAsync();

            return Ok(new { id = qr.Id, at = qr.CreatedAt });
        }

        [HttpGet("quiz")]
        public async Task<IActionResult> GetMyQuiz()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var list = await _db.QuizResults
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreatedAt)
                .Take(100)
                .ToListAsync();

            return Ok(list);
        }

        public record DnaLogDto(string Type, string? Input, string? Output, string? MetaJson);
        public record QuizLogDto(int Score, int Total, int AvgMs, string? Kind);
    }
}
