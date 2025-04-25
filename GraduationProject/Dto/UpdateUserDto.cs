using System.ComponentModel.DataAnnotations;

namespace GraduationProject.Dto
{
    public class UpdateUserDto
    {
        [Required]
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? CurrentPassword { get; set; }
        public string? BIO { get; set; }
        public string? Password { get; set; }
        public IFormFile? Image { get; set; }
        public string? Introduction { get; set; }
        public string? CVUrl { get; set; }
        public string? Username { get; set; }
        public string? Role { get; set; }
        public bool? IsApproved { get; set; }
    }
}
