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
    [Authorize("InstructorAndAdminPolicy")]
    public class CourseTagController : ControllerBase
    {
        private readonly AppDBContext _context;

        public CourseTagController(AppDBContext context)
        {
            _context = context;
        }

        [HttpPost("course/{courseId}")]
        [ServiceFilter(typeof(CustomModelStateFilter))]
        public async Task<IActionResult> AddCourseTag(int courseId, [FromBody] AddTagDto Dto )
        {   
            
            var course = await _context.courses.Include(c => c.CourseTags).FirstOrDefaultAsync(c => c.Id == courseId);
            if (course == null)
            {
                return NotFound(new { Message = "Course not found" });
            }
            var userId = int.Parse(User.FindFirst("Id")?.Value);
            var userRole = User.FindFirst("Role")?.Value;

           
            if (userRole == "teacher" && course.Instructor_Id != userId)
            {
                return Unauthorized(new { Message = "You can only update your own courses" });
            }

 

                // Add new tags
                foreach (var tagName in Dto.Tag)
                {
                    var tag = await _context.Tags.FirstOrDefaultAsync(t => t.Name == tagName);
                    if (tag == null)
                    {
                        tag = new Tag { Name = tagName };
                       await _context.Tags.AddAsync(tag);
                    }

                    course.CourseTags.Add(new CourseTag { Tag = tag });
                }
                _context.SaveChanges();
            return Ok("Tag Added Successfully");
        }

        // DELETE: api/CourseTag/course/{courseId}/tag/{tagId}
        [HttpDelete("course/{courseId}/tag/{tagId}")]
        public async Task<IActionResult> DeleteCourseTag(int courseId, int tagId)
        {
            // Get the current user's ID from the claims
            var currentUserId = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(currentUserId) || !int.TryParse(currentUserId, out int userId))
            {
                return Unauthorized(new{mesage ="User not authenticated properly."});
            }

            // First, check if the course exists and if the current user is the instructor
            var course = await _context.courses
                .FirstOrDefaultAsync(c => c.Id == courseId);

            if (course == null)
            {
                return NotFound( "Course not found.");
            }

            // Check if the current user is the instructor of the course
            if (course.Instructor_Id != userId)
            {
                return Forbid("Only the course instructor can delete course tags.");
            }

            // Find the course tag
            var courseTag = await _context.CourseTags
                .FirstOrDefaultAsync(ct => ct.CourseId == courseId && ct.TagId == tagId);

            if (courseTag == null)
            {
                return NotFound("Course tag not found.");
            }

            try
            {
                _context.CourseTags.Remove(courseTag);
                await _context.SaveChangesAsync();
                return Ok("Course tag deleted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
