using System.ComponentModel.DataAnnotations;

namespace GraduationProject.Dto
{
    public class SectionDto
    {
        [Required(ErrorMessage = "please enter name"),MaxLength(50)]
        public string Name { get; set; }
        [Required(ErrorMessage = "course id is required")]
        public int CourseId { get; set; }
    }
}
