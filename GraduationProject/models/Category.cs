namespace GraduationProject.models
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime CreatonDate { get; set; }
        public int? CreatedById { get; set; }
        public virtual User? CreatedBy{ get; set;}

    }
}
