namespace GraduationProject.Dto
{
    public class Allcoursedto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Describtion { get; set; }
        public string CourseCategory { get; set; }
        public double No_of_hours { get; set; }
        public int Instructor_Id { get; set; }
        public string InstructorName { get; set; }
        public int No_of_students { get; set; }
        public DateTime CreationDate { get; set; }
        public string LevelOfCourse { get; set; }
        public string ImgUrl { get; set; }
        public double AverageRating { get; set; }
        public double Price { get; set; }
        public double Discount { get; set; }
        public double DiscountedPrice { get; set; }
        public List<AllTagDto> Tags { get; set; }
        public List<ALLSectionDto> Sections { get; set; }
    }
    public class AllTagDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }
    public class ALLSectionDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public List<AllLessonDto> Lessons { get; set; }
    }
    public class AllLessonDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string FileBath { get; set; }
        public double DurationInHours { get; set; }
    }
    public class PaginatedResult<T>
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public List<T> Data { get; set; }
    }

}
