using GraduationProject.models;

namespace GraduationProject.Services
{
    public interface IUnitOfWork : IDisposable
    {
        public IGenaricRepository<User> Users { get;  }
        public ICourseRepository Courses { get; }
        IGenaricRepository<Contactus> Contactus { get; }
        public IGenaricRepository<Category> category { get; }
        public IGenaricRepository<Subscription> Subscribtion { get; }
        public IGenaricRepository<ToDo> ToDo { get; }
        int Complete();
        Task<int> CompleteAsync();
    }
}
