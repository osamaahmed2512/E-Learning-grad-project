using System.Text.Json.Serialization;

namespace GraduationProject.Dto
{
    public class RecommendationResult
    {
        [JsonPropertyName("Course ID")]
        public int CourseId { get; set; }

        [JsonPropertyName("Course Title")]
        public string CourseTitle { get; set; }

        [JsonPropertyName("AverageRating")]
        public double AverageRating { get; set; }

        [JsonPropertyName("ImgUrl")]
        public string ImgUrl { get; set; }

        [JsonPropertyName("Difficulty Level")]
        public string DifficultyLevel { get; set; }

        [JsonPropertyName("CourseCategory")]
        public string CourseCategory { get; set; }
      
        [JsonPropertyName("price")]
        public double Price { get; set; }

        [JsonPropertyName("discount")]
        public double Discount { get; set; }

        [JsonPropertyName("discounted_price")]
        public double DiscountedPrice { get; set; }
    }
}
