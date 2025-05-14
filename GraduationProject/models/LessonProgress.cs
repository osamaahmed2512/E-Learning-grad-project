using Humanizer;

namespace GraduationProject.models
{
    public class LessonProgress
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int LessonId { get; set; }
        public int WatchedSeconds { get; set; }
        public DateTime LastUpdated { get; set; }
        public Lesson Lesson { get; set; }
    }
}
