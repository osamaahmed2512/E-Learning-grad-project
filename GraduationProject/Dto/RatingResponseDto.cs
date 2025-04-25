using Microsoft.CodeAnalysis.Options;

namespace GraduationProject.Dto
{
    public class RatingResponseDto
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; }
        public int CourseId { get; set; }
        public string CourseName { get; set; }
        public int Stars { get; set; }
        public string? Review { get; set; }
        public DateTime RatingDate { get; set; }
    }
}
