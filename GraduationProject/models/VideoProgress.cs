namespace GraduationProject.models
{
    public class VideoProgress
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public int LessonId { get; set; }
        public float WatchedDuration { get; set; } // in hours
        public float TotalDuration { get; set; } // in hours
        public bool IsCompleted { get; set; }
        public DateTime LastWatched { get; set; }

        public virtual User Student { get; set; }
        public virtual Lesson Lesson { get; set; }
    }
}
