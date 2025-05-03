using System.ComponentModel.DataAnnotations;

namespace GraduationProject.Dto
{
    public class CourseUpdateDto
    {
        [Required(ErrorMessage = "Course name is required")]
        [StringLength(100, ErrorMessage = "Course name can't be longer than 100 characters")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Description is required")]
        [StringLength(1000, ErrorMessage = "Description can't be longer than 1000 characters")]
        public string Describtion { get; set; }
        [Required(ErrorMessage = "Course category is required")]
        [StringLength(50, ErrorMessage = "Category can't be longer than 50 characters")]
        public string CourseCategory { get; set; }

        [Required(ErrorMessage = "Level of course is required")]
        [RegularExpression("^(beginner|intermediate|advanced)$", ErrorMessage = "Level must be beginner, intermediate, or advanced")]
        public string LevelOfCourse { get; set; }
        [Range(0, double.MaxValue, ErrorMessage = "Price must be a non-negative number")]
        public double Price { get; set; }
        [Range(0, 100, ErrorMessage = "Discount must be between 0 and 100")]
        public double? Discount { get; set; } = 0;
        public IFormFile? Image { get; set; }
        public List<string>? Tag { get; set; }

    }
}
