using System.ComponentModel.DataAnnotations;

namespace GraduationProject.Dto
{

    public class TimerSettingDto
    {
 
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
    }

}
