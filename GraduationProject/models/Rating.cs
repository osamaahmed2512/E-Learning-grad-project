namespace GraduationProject.models
{
    public class Rating
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public int CourseId { get; set; }
        public int ClickCount { get; set; } = 0;
        public double TimeSpentHours { get; set; } = 0;
        public string CompletionStatus { get; set; }
     
        public int Stars { get; set; }
        public string? Review { get; set; }
        public DateTime RatingDate { get; set; } = DateTime.UtcNow;
        public User student { get; set; }
        public Course Course { get; set; }
    }
}
