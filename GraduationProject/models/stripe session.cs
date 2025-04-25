using Stripe;

namespace GraduationProject.models
{
    public class stripe_session
    {
        public int Id { get; set; }
        public string Session { get; set; }
        public int CourseId { get; set; }
        public int StudentId { get; set; }
       
    }
}
