using GraduationProject.consts;
using GraduationProject.data;
using MailKit.Search;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Asn1;
using Polly;
using System.Linq.Expressions;

namespace GraduationProject.Services
{
    public class GenaricRepository<T> : IGenaricRepository<T> where T : class
    {  
        private readonly AppDBContext _Context;

        public GenaricRepository(AppDBContext dBContext)
        {
            _Context = dBContext;
        }

        public  T GetById(int id)
        {
            return _Context.Set<T>().Find(id);
        }
        public IQueryable<T> Query()
        {
            return _Context.Set<T>().AsQueryable();
        }

        public IEnumerable<T> GEtAll()
        {
            return _Context.Set<T>().ToList();
        }
        public async Task<IEnumerable<T>> GEtAllasync()
        {
            return await _Context.Set<T>().ToListAsync();
        }

        public async Task<IEnumerable<T>> GEtAllasync(Expression<Func<T, object>> orderBy ,
            string sortingorder = "Descending", string[] includes = null , int? skip = null, int? take = null)
        {
            var query = _Context.Set<T>().AsQueryable();
            if (includes != null)
            {
                foreach (var include in includes)
                    query = query.Include(include);
            }

            // Sorting based on the criteria
            if (sortingorder == "Descending")
            {
                query = query.OrderByDescending(orderBy);  // Order by descending based on orderBy field
            }
            else
            {
                query = query.OrderBy(orderBy);  // Order by ascending based on orderBy field
            }
            if (skip.HasValue)
            {
                query = query.Skip(skip.Value);
            }
            if (take.HasValue)
            {
                query = query.Take(take.Value);
            }

            return await query.ToListAsync();
        }
        public async Task<T> GetByIdAsync(int id)
        {
            return await _Context.Set<T>().FindAsync(id);
        }

        public IEnumerable<T> Find(Expression<Func<T, bool>> criteria, string[] includes = null)
        {
            IQueryable<T> query = _Context.Set<T>();

            if (includes != null)
                foreach (var include in includes)
                    query = query.Include(include);

            return query.Where(criteria).ToList();
        }
        public IEnumerable<T> FindAll(Expression<Func<T, bool>>? criteria, string[] includes = null, Expression<Func<T, object>> orderBy = null,
            string? orderByDirection = Sorting.Ascending ,int? skip =null , int? take = null)
        {
            IQueryable<T> query = _Context.Set<T>();

            if (includes != null)
                foreach (var include in includes)
                    query = query.Include(include);
            if (criteria != null)
            {
                query = query.Where(criteria);
            }

            if (orderBy != null)
            {
                query = orderByDirection==Sorting.Descending
                    ?query.OrderByDescending(orderBy):
                    query.OrderBy(orderBy);

            }
            if (skip.HasValue)
            {
                query = query.Skip(skip.Value);
            }
            if (take.HasValue)
            {
                query = query.Take(take.Value);
            }
            return query.ToList();
        }
        public async Task<IEnumerable<T>> FindAllAsync(Expression<Func<T, bool>> criteria, string[] includes = null)
        {
            IQueryable<T> query = _Context.Set<T>();

            if (includes != null)
                foreach (var include in includes)
                    query = query.Include(include);

            return await query.Where(criteria).ToListAsync();
        }
        public void Add(T entity)
        {
            _Context.Set<T>().Add(entity);
            _Context.SaveChanges();
        }

        public async Task<T> AddAsync(T entity)
        {
           var result = await  _Context.Set<T>().AddAsync(entity);
           return result.Entity;
        }


        public void AddRange(IEnumerable<T> entities)
        {
            _Context.Set<T>().AddRange(entities);
            _Context.SaveChanges();
        }

        public async Task<T?> FindOneAsync(Expression<Func<T, bool>> predicate)
        {
             return await _Context.Set<T>().FirstOrDefaultAsync(predicate);
        }

        public  void Delete(T entity)
        {
             _Context.Set<T>().Remove(entity);
        }

        public async Task DeleteRange(IEnumerable<T> entities)
        {
            _Context.Set<T>().RemoveRange(entities);
            await _Context.SaveChangesAsync();
        }
        public async Task<T> UpdateAsync(int id, T entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            var existingEntity = await GetByIdAsync(id);
            if (existingEntity == null)
                return null;

            _Context.Entry(existingEntity).CurrentValues.SetValues(entity);
            return existingEntity;
        }
        public async Task<int> Count(Expression<Func<T,bool>>? predicate =null)
        {
            var query = _Context.Set<T>().AsQueryable();
            if (predicate != null)
            {
                query = query.Where(predicate);
            }
            return await query.CountAsync();
        }
    }
}
