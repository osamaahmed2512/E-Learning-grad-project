using Azure;
using System.Text.Json.Serialization;

namespace GraduationProject.models
{
    public class CourseTag
    {
        public int CourseId { get; set; }
        [JsonIgnore]
        public Course Course { get; set; }

        public int TagId { get; set; }
        
        public Tag Tag { get; set; }
    }
}
