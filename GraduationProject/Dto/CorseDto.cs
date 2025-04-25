using System.ComponentModel.DataAnnotations;

namespace GraduationProject.Dto
{
    public class CourseDto
    {
        public string Name { get; set; }
        public string Describtion { get; set; }
        public string CourseCategory { get; set; }
        [Required(ErrorMessage ="error message course is required")]
        public IFormFile Image { get; set; }
        public List<string> Tag { get; set; } = new List<string>();
        public string LevelOfCourse { get; set; }
        // intermediate - easy - Hard
        public double Price { get; set; }
        public double? Discount { get; set; } = 0;
    }
}
