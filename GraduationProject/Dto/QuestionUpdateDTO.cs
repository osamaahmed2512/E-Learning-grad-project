namespace GraduationProject.Dto
{
    public class QuestionUpdateDTO
    {
       
        public string? QuestionText { get; set; }
        public List<AnswerUpdateDTO>? Answers { get; set; }
    }

    public class AnswerUpdateDTO
    {
        public string AnswerText { get; set; }
        public bool IsCorrect { get; set; } = false;
    }
}
