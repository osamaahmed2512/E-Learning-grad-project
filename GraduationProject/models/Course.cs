using System.Text.Json.Serialization;

namespace GraduationProject.models
{
    public class Course
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Describtion { get; set; }
        public string CourseCategory { get; set; }
        public int no_of_students { get; set; } = 0;
        public int Instructor_Id { get; set; }
        public double No_of_hours { get; set; } = 0;
        public DateTime CreationDate { get; set; } = DateTime.UtcNow;

        public string ImgUrl { get; set; } = "default-image-url.jpg";
        public string LevelOfCourse { get; set; }
        public double Price { get; set; }
        public double Discount { get; set; } = 0;
        public double DiscountedPrice  => Price - (Price * Discount / 100);
        public virtual List<CourseTag>? CourseTags { get; set; }
        public virtual User? Instructor { get; set; }

        public double AverageRating { get; set; }
        public List<Rating>? Rating { get; set; }
        public virtual List<Section>? Sections { get; set; } = new List<Section>();

    }
}
