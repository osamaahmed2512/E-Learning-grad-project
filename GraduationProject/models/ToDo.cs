using System.ComponentModel.DataAnnotations;

namespace GraduationProject.models
{
    public class ToDo
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        [RegularExpression("^(todo|doing|done)$")]
        public string Status { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

       
        public int UserId { get; set; }

      
        public virtual User? User { get; set; }
    }
}
