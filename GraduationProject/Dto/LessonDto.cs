using System.ComponentModel.DataAnnotations;

namespace GraduationProject.Dto
{
    public class LessonDto
    {
        [Required(ErrorMessage ="please enter title of lesson"),MaxLength(50)]
        
        public string Title { get; set; }
        public string? Description { get; set; }
        [Required(ErrorMessage = "section id must not be null")]
        public int SectionId { get; set; }

        [Required(ErrorMessage = "Please upload a video file.")]
        public IFormFile video { get; set; }

    }
}
