namespace GraduationProject.models
{
    public class Contactus
    {
        public int Id { get; set; }
        public string email { get; set; }
        public string Message { get; set; }
        public DateTime date { get; set; }
        public int UserId { get; set; }
        public virtual User user { get; set; }
    }
}
