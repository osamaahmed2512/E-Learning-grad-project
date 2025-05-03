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
           var userId = int.Parse(User.FindFirst("Id")?.Value);
            var section = new Section
            {
                Name = sectionDto.Name,
                CourseId = sectionDto.CourseId,
                UserId = userId
            };

            _context.Sections.Add(section);
            await _context.SaveChangesAsync();

            return Ok(new {id=section.Id , Message = "Section added successfully" });
        }
        [HttpPut]
        [Route("UpdateSection/{id}")]
        [Authorize(Policy = "InstructorAndAdminPolicy")]
        [ServiceFilter(typeof(CustomModelStateFilter))]
        public async Task<IActionResult> UpdateSection(int id, [FromBody] updatesectionDto sectionDto)
        {
            try
            {
                // Find the section by ID
                var section = await _context.Sections.FindAsync(id);
                if (section == null)
                {
                    return NotFound(new { Message = "Section not found" });
                }
                var userId = int.Parse(User.FindFirst("Id")?.Value);
                if (section.UserId != userId)
                {
                    return Unauthorized(new { Message = "You can only update your own section" });
                }
                // Ensure the course exists
                var course = await _context.courses.FindAsync(section.CourseId);
                if (course == null)
                {
                    return NotFound(new { Message = "Course not found" });
                }

                // Update section properties
                section.Name = sectionDto.Name;

                // Save changes to the database
                await _context.SaveChangesAsync();

                return Ok(new { id = section.Id, Message = "Section updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while updating the section", Error = ex.Message });
            }
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
        [HttpDelete]
        [Route("DeleteSection/{id}")]
        [Authorize(Policy = "InstructorAndAdminPolicy")]
        public async Task<IActionResult> DeleteSection(int id)
        {
            try
            {
                // Find the section by ID, including its lessons
                var section = await _context.Sections
                    .Include(s => s.Lessons)
                    .FirstOrDefaultAsync(s => s.Id == id);

                if (section == null)
                {
                    return NotFound(new { Message = "Section not found" });
                }
                var userId = int.Parse(User.FindFirst("Id")?.Value);
                if (section.UserId != userId)
                {
                    return Unauthorized(new { Message = "You can only update your own section" });
                }
                // Delete associated lessons, if any
                if (section.Lessons != null && section.Lessons.Any())
                {
                    _context.Lesson.RemoveRange(section.Lessons);
                }

                // Remove the section
                _context.Sections.Remove(section);

                // Save changes to the database
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Section deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while deleting the section", Error = ex.Message });
            }
        }




    }
}
