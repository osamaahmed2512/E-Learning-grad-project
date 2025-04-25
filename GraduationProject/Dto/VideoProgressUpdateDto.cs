namespace GraduationProject.Dto
{
    public class VideoProgressUpdateDto
    {
        public int LessonId { get; set; }
        public float CurrentTime { get; set; } 
        public float TotalDuration { get; set; } 
        public bool IsCompleted { get; set; }
    }
}
