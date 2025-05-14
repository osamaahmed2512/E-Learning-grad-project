using System.ComponentModel.DataAnnotations;

namespace GraduationProject.Dto
{
    public class UpdateTimerStateDto
    {
        [Required]
        public int UserId { get; set; }
        public int RemainingTime { get; set; }
        public bool IsPlaying { get; set; }
        public string Mode { get; set; }
    }
}
