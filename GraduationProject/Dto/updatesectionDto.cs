using System.ComponentModel.DataAnnotations;

namespace GraduationProject.Dto
{
    public class updatesectionDto
    {
        [Required(ErrorMessage = "please enter name"), MaxLength(50)]
        public string Name { get; set; }
    }
}
