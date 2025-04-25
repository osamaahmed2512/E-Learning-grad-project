namespace GraduationProject.models
{
    public class FlashCard
    {
        public int Id { get; set; }
        public string Question { get; set; }
        public string Answer { get; set; }

        public string Difficulty { get; set; }  // "mastered", "easy", "medium", "hard", "new"
        public DateTime CreatedAt { get; set; }
        public DateTime? LastModified { get; set; }
        public string CreatedBy { get; set; }
        public string LastModifiedBy { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }

    }
}
