using System.ComponentModel.DataAnnotations;

namespace GraduationProject.models
{
    public class TimerSettings
    {
        public int Id { get; set; }
        [Required]
        public int UserId { get; set; } // Foreign key to User

        public virtual User User { get; set; } // Navigation property

        [Required]
        public int WorkDuration { get; set; } = 25;

        [Required]
        public int ShortBreakDuration { get; set; } = 5;

        [Required]
        public int LongBreakDuration { get; set; } = 20;

        public int CustomWorkDuration { get; set; } = 0;

        public int CustomBreakDuration { get; set; } = 0;

        [Required]
        public string ActiveMode { get; set; } = "work";

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}
