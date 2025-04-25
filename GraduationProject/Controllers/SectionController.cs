using GraduationProject.data;
using GraduationProject.Dto;
using GraduationProject.models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GraduationProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SectionController : ControllerBase
    {
        private readonly AppDBContext _context;
        public SectionController(AppDBContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Route("AddSection")]
        [Authorize(Policy = "InstructorAndAdminPolicy")]
        [ServiceFilter(typeof(CustomModelStateFilter))]
        public async Task<IActionResult> AddSection([FromBody] SectionDto sectionDto)
        {
            var course = await _context.courses.FindAsync(sectionDto.CourseId);
            if (course == null)
            {
                return NotFound(new { Message = "Course not found" });
            }

            var section = new Section
            {
                Name = sectionDto.Name,
                CourseId = sectionDto.CourseId
            };

            _context.Sections.Add(section);
            await _context.SaveChangesAsync();

            return Ok(new {id=section.Id , Message = "Section added successfully" });
        }
        [HttpGet]
        [Route("GetSectionsByCourseId/{courseId}")]
        public async Task<IActionResult> GetSectionsByCourseId(int courseId)
        {
            var sections = await _context.Sections
                .Where(s => s.CourseId == courseId)
                .Include(s => s.Lessons)
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    Lessons = s.Lessons.Select(l => new
                    {
                        l.Id,
                        l.Name,
                        l.Description,
                        l.FileBath
                    }).ToList()
                })
                .ToListAsync();

            return Ok(sections);
        }
    }
}
