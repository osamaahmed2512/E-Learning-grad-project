using GraduationProject.Controllers;
using Stripe.Tax;

namespace GraduationProject.models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Role { get; set; }
        public string? ImageUrl { get; set; }
        public string? BIO { get; set; }
        public string? Introduction { get; set; } 
        public string? CVUrl { get; set; }
        public string? PreferredCategory { get; set; }
        public string? Username { get; set; }
        public string? SkillLevel { get; set; }
        public bool IsApproved { get; set; } = false;
        public DateTime RegistrationDate { get; set; }
        public List<Course> Courses { get; set; }
        public List<FlashCard> FlashCards { get; set; }
        public ICollection<Rating> Rating { get; set; }
        public int? CreatedById { get; set; }
        public User? CreatedBy { get; set; } 
        public virtual List<Contactus>? ContactUs { get; set; }
        public int TotalCompletedTasks { get; set; } = 0;
        public bool HasCompleted10Tasks { get; set; } = false;

    }
}
