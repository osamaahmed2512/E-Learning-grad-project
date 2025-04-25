using GraduationProject.Dto;
using GraduationProject.models;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace GraduationProject.Services
{
    public interface ICourseRepository:IGenaricRepository<Course>
    {
        Task<PaginatedResult<Allcoursedto>> GetAllCoursesAsync(CourseQueryParameters parameters);

    }
}
