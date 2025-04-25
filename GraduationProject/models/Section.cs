namespace GraduationProject.models
{
    public class Section
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int CourseId { get; set; }
        public virtual Course Course { get; set; }
        public virtual List<Lesson> Lessons { get; set; }
    }
}
