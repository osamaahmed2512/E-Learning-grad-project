using System.Text.Json.Serialization;

namespace GraduationProject.models
{
    public class Answer
    {
        public int Id { get; set; }
        public string AnswerText { get; set; }
        public bool IsCorrect { get; set; } = false;
        public int QuestionId { get; set; }
        [JsonIgnore]
        public Question Question { get; set; }
    }
}
