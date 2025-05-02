using System.ComponentModel.DataAnnotations;

namespace GraduationProject.Dto
{
    public class ToDoDto
    {
        [Required(ErrorMessage ="Title is Required")]
        public string Title { get; set; }

        [Required(ErrorMessage ="Status iS required")]
        [RegularExpression("^(todo|progress|completed)$" ,ErrorMessage = "stutus must be todo or progress or completed ")]
        public string Status { get; set; }
    }
    public class updateTodoDto:ToDoDto
    {
        public int Id { get; set; }
    }
}
