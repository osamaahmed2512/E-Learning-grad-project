using GraduationProject.Helpers.Attribute;
using System.ComponentModel.DataAnnotations;

namespace GraduationProject.Dto
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 50 characters")]
        [RegularExpression(@"^[\p{L} \.'\-]+$", ErrorMessage = "Name can only contain letters, spaces, apostrophes, or hyphens")]

        public string Name { get; set; }
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [UniqueEmail(ErrorMessage = "Email is already in use")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Password is required")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters")]
        [RegularExpression(@"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$", ErrorMessage = "Password must contain letters and numbers")]
        public string Password { get; set; }

        [Required(ErrorMessage = "Role is required")]
        [RegularExpression("^(student|teacher|admin)$", ErrorMessage = "Role must be either 'student', 'teacher', or 'admin'")]
        public string Role { get; set; }
        public string? Introducton { get; set; }
        public string? PreferredCategory { get; set; }
        public string? SkillLevel { get; set; }
        public string? BIO { get; set; }
        public IFormFile? CV { get; set; }
       
    }
}
