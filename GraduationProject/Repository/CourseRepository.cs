using GraduationProject.data;
using GraduationProject.Dto;
using GraduationProject.models;
using GraduationProject.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Drawing.Printing;
using System.Globalization;

namespace GraduationProject.Repository
{
    public class CourseRepository : GenaricRepository<Course>, ICourseRepository
    {
        private readonly AppDBContext _context;
        public CourseRepository(AppDBContext context): base(context) 
        {
            _context = context;
        }

        public async Task<PaginatedResult<Allcoursedto>> GetAllCoursesAsync(CourseQueryParameters parameters)
        {
            var query = _context.courses
               .Include(c => c.CourseTags).ThenInclude(ct => ct.Tag)
               .Include(c => c.Instructor)
               .Include(c => c.Sections).ThenInclude(s => s.Lessons)
               .AsQueryable();

            // Filter (Search)
            if (!string.IsNullOrEmpty(parameters.SearchTerm))
            {
                query = query.Where(c =>
                    c.Name.Contains(parameters.SearchTerm) ||
                    c.Describtion.Contains(parameters.SearchTerm) ||
                    c.Instructor.Name.Contains(parameters.SearchTerm )||
                   c.CourseTags.Any(ct =>ct.Tag.Name.Contains(parameters.SearchTerm))
                    );
            }
            // Save total count before pagination
            int totalCount = await  query.CountAsync();
            // Sorting
            if (!string.IsNullOrEmpty(parameters.SortBy))
            {
                bool ascending = parameters.SortOrder?.ToLower() != "desc";

                // Basic sorting examples (extend as needed)
                switch (parameters.SortBy.ToLower())
                {
                    case "name":
                        query = ascending ? query.OrderBy(c => c.Name) : query.OrderByDescending(c => c.Name);
                        break;
                    case "price":
                        query = ascending ? query.OrderBy(c => c.Price) : query.OrderByDescending(c => c.Price);
                        break;
                    case "rating":
                        query = ascending ? query.OrderBy(c => c.AverageRating) : query.OrderByDescending(c => c.AverageRating);
                        break;
                    case "id":
                        query = ascending ? query.OrderBy(c => c.Id) : query.OrderByDescending(c => c.Id);
                        break;
                    default:
                        query = query.OrderBy(c => c.Id); // default sort
                        break;
                }
            }

            // Pagination
            query = query.Skip((parameters.PageNumber - 1) * parameters.PageSize).Take(parameters.PageSize);

            // Project to DTO
            var data =await  query.Select(c => new Allcoursedto
            {
                Id = c.Id,
                Name = c.Name,
                Describtion = c.Describtion,
                CourseCategory = c.CourseCategory,
                No_of_hours = c.No_of_hours,
                Instructor_Id = c.Instructor_Id,
                InstructorName = c.Instructor.Name,
                No_of_students = c.no_of_students,
                CreationDate = c.CreationDate,
                LevelOfCourse = c.LevelOfCourse,
                ImgUrl = c.ImgUrl,
                AverageRating = c.AverageRating,
                Price = c.Price,
                Discount = c.Discount,
                DiscountedPrice = c.DiscountedPrice,
                Tags = c.CourseTags.Select(ct => new AllTagDto
                {
                    Id = ct.Tag.Id,
                    Name = ct.Tag.Name
                }).ToList(),
                Sections = c.Sections.Select(s => new ALLSectionDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Lessons = s.Lessons.Select(l => new AllLessonDto
                    {
                        Id = l.Id,
                        Name = l.Name,
                        Description = l.Description,
                        FileBath = l.FileBath,
                        DurationInHours = l.DurationInHours
                    }).ToList()
                }).ToList()
            }).ToListAsync();

            return new PaginatedResult<Allcoursedto>
            {
                Page = parameters.PageNumber,
                PageSize = parameters.PageSize,
                TotalCount = totalCount,
                Data = data
            };
        }
    }
}
