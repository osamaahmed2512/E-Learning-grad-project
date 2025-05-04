using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace GraduationProject.models
{
    public class PomodoroSession
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        [Required]
        public string SessionType { get; set; } // "work", "short", "long", "customWork", "customBreak"

        [Required]
        public int Duration { get; set; } // Duration in minutes

        public int? CompletedDuration { get; set; } // Actual completed duration in minutes

        public bool IsCompleted { get; set; }

        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}
