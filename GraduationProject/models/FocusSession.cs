using System.ComponentModel.DataAnnotations;

namespace GraduationProject.models
{
    public class FocusSession
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }
        public virtual User User { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public int WorkMinutes { get; set; } = 0;

        [Required]
        public int BreakMinutes { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
