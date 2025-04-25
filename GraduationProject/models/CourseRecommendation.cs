using System.Text.Json.Serialization;

namespace GraduationProject.models
{
    public class CourseRecommendation
    {
        public int CourseId { get; set; }
        public string Name { get; set; }
        public string Describtion { get; set; }  // Note: This is misspelled in your data, keep it for consistency
        public string Keywords { get; set; }
        public string CourseCategory { get; set; }
        public string LevelOfCourse { get; set; }
        [JsonPropertyName("Average Rating")]
        public double AverageRating { get; set; }
    }
}
