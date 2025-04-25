
using System.ComponentModel.DataAnnotations;

namespace GraduationProject.Dto
{
    public class CategoryDto
    {
        [Required(ErrorMessage = "Category name is required")]
        [StringLength(80, MinimumLength =3,ErrorMessage = "Category name must be between 3 and 100 characters")]
        public string Name { get; set; }
    }
}
