using GraduationProject.models;

namespace GraduationProject.Dto
{
    public class QuestionCreateDto
    {
        public string QuestionText { get; set; }
        public List<AnswerCreateDto> Answers { get; set; }

    }
}
