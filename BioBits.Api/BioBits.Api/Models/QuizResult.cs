using System.ComponentModel.DataAnnotations;

namespace BioBits.Api.Models
{
    public class QuizResult
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = null!;

        public int Score { get; set; }
        public int Total { get; set; }
        public int AvgMs { get; set; }

        [MaxLength(100)]
        public string? Kind { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
