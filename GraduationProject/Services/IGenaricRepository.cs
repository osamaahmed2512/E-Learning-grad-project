using GraduationProject.consts;
using System.Linq.Expressions;

namespace GraduationProject.Services
{
    public interface IGenaricRepository<T> where T : class
    {
        T GetById(int id);
        Task<T> GetByIdAsync(int id);
        IQueryable<T> Query();
        IEnumerable<T> GEtAll();
        Task<IEnumerable<T>> GEtAllasync();
        IEnumerable<T> Find(Expression<Func<T, bool>> criteria, string[] includes = null);
        public IEnumerable<T> FindAll(Expression<Func<T, bool>>? criteria, string[] includes = null, Expression<Func<T, object>> orderBy = null,
            string? orderByDirection = Sorting.Ascending, int? skip = null, int? take = null);
        Task<IEnumerable<T>> FindAllAsync(Expression<Func<T, bool>> criteria, string[] includes = null);
        Task<IEnumerable<T>> GEtAllasync(Expression<Func<T, object>> orderBy , string sortingorder = "Descending", string[] includes = null, int? skip = null, int? take = null);
        void Add(T entity);
        Task<T> AddAsync(T entity);
        Task<T> UpdateAsync(int id, T entity);
        void AddRange(IEnumerable<T> entities);
        Task<int> Count(Expression<Func<T, bool>>? predicate=null);
        Task<T?> FindOneAsync(Expression<Func<T, bool>> predicate);
        void Delete(T entity);
        Task DeleteRange(IEnumerable<T> entities);
    }
}
