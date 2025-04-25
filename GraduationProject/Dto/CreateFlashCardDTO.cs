using GraduationProject.models;
using System.ComponentModel.DataAnnotations;

namespace GraduationProject.Dto
{
    public class CreateFlashCardDTO
    {
        [Required]
        public string Question { get; set; }
        [Required]
        public string Answer { get; set; }
        [Required]
        [FlashCardDifficulties]
        public string Difficulty { get; set; } = "new";
    }
}
