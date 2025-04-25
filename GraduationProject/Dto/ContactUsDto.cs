using System.ComponentModel.DataAnnotations;

namespace GraduationProject.Dto
{
    public class ContactUsDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        [Required]
        public string Message { get; set; }
    }
}
