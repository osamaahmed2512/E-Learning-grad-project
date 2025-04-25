namespace GraduationProject.models
{
    public class Lesson
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public string FileBath { get; set; }
        public int SectionId { get; set; }
        public double DurationInHours { get; set; }
        public virtual Section Section { get; set; }

        //public List<LessonTag> LessonTags { get; set; }
        public virtual List<Question> Questions { get; set; } = new List<Question>();
    }
}
