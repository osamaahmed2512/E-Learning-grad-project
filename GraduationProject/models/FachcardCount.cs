using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GraduationProject.models
{
    public class FachcardCount
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)] 
        [ForeignKey("User")] 
        public int Id { get; set; }

        public int FlashCardCount { get; set; }

        public User User { get; set; }
    }
}
