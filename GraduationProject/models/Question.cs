namespace GraduationProject.models
{
    public class Question
    {
        public int Id { get; set; }
        public string QuestionText { get; set; }
        public int LessonId { get; set; }
        public Lesson Lesson { get; set; }
        public List<Answer> Answers { get; set; } = new List<Answer>();

    }
}
