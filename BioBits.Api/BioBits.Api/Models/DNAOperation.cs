using System.ComponentModel.DataAnnotations;

namespace BioBits.Api.Models
{
    public class DnaOperation
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = null!;

        [Required]
        [MaxLength(40)]
        public string Type { get; set; } = null!;

        public string? Input { get; set; }
        public string? Output { get; set; }

        public string? MetaJson { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
