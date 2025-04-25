namespace GraduationProject.Dto
{
    public class LessonQuestionsCreateDTO
    {
        public int LessonId { get; set; }
        public List<QuestionCreateDto> Questions { get; set; }
    }
}
