namespace GraduationProject.Dto
{
    public class RatingCreateDto
    {
        public int StudentId { get; set; }
        public int CourseId { get; set; }
        public int Stars { get; set; }
       
        public string? Review { get; set; }
    }
}
