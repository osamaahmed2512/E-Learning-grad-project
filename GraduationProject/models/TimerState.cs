using System.ComponentModel.DataAnnotations;

namespace GraduationProject.models
{
    public class TimerState
    {
        public int Id { get; set; }
        [Required]
        public int UserId { get; set; } 

        public virtual User User { get; set; } 

        public int RemainingTime { get; set; }

        public bool IsPlaying { get; set; }

        public string Mode { get; set; }

        public DateTime LastUpdated { get; set; } = DateTime.Now;
    }
}
