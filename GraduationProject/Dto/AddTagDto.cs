using System.ComponentModel.DataAnnotations;

namespace GraduationProject.Dto
{
    public class AddTagDto
    {
        [Required(ErrorMessage ="please enter tags")]
        public List<string> Tag { get; set; }
    }
}
