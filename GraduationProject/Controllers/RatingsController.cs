using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GraduationProject.data;
using GraduationProject.models;
using GraduationProject.Dto;
using Microsoft.AspNetCore.Authorization;

namespace GraduationProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RatingsController : ControllerBase
    {
        private readonly AppDBContext _context;

        public RatingsController(AppDBContext context)
        {
            _context = context;
        }

        // GET: api/Ratings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Rating>>> GetRating()
        {
            return await _context.Rating
               .Include(r => r.student)
               .Include(r => r.Course)
               .ToListAsync();
        }

        [HttpGet("myrating/{courseId}")]
        [Authorize(Policy = "StudentPolicy")]
        public async Task<ActionResult<RatingResponseDto>> GetMyRatingForCourse(int courseId)
        {
            var userId = int.Parse(User.FindFirst("Id")?.Value);

            var rating = await _context.Rating
                .Include(r => r.Course)
                .Include(r => r.student)
                .FirstOrDefaultAsync(r => r.CourseId == courseId && r.StudentId == userId);

            if (rating == null)
            {
                return NotFound("You have not rated this course yet.");
            }

            var dto = new RatingResponseDto
            {
                Id = rating.Id,
                StudentId = rating.StudentId,
                StudentName = rating.student.Name,
                CourseId = rating.CourseId,
                CourseName = rating.Course.Name,
                Stars = rating.Stars,
                Review = rating.Review,
                RatingDate = rating.RatingDate
            };

            return Ok(dto);
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<Rating>> GetRating(int id)
        {
            var rating = await _context.Rating.FindAsync(id);

            if (rating == null)
            {
                return NotFound($"rating with id {id} is not found");
            }

            return rating;
        }

        [HttpPut("updatestars/{courseId}")]
        [Authorize(Policy = "StudentPolicy")]
        public async Task<IActionResult> UpdateRatingStars(int courseId, [FromBody] int newStars)
        {
            var userId = int.Parse(User.FindFirst("Id")?.Value);

            if (newStars < 1 || newStars > 5)
            {
                return BadRequest("Stars must be between 1 and 5.");
            }

            var rating = await _context.Rating
                .FirstOrDefaultAsync(r => r.CourseId == courseId && r.StudentId == userId);

            if (rating == null)
            {
                return NotFound("Rating not found.");
            }

            rating.Stars = newStars;
            rating.RatingDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await UpdateCourseAverage(courseId);

            return Ok("Rating updated successfully.");
        }

        [HttpPost]
        [Authorize(Policy = "StudentPolicy")]
        public async Task<ActionResult<RatingResponseDto>> AddRating(RatingCreateDto ratingdto)
        {

            var UserId = int.Parse(User.FindFirst("Id")?.Value);
            var student = await _context.users.FirstOrDefaultAsync(u =>u.Id == UserId);
            if (student == null)
            {
              return BadRequest($"user with id {UserId} is not found");
            }
            var course = await _context.courses.FirstOrDefaultAsync(u => u.Id == ratingdto.CourseId);
            if (course == null)
            {
                return BadRequest($"Course with id {ratingdto.CourseId} is not found");
            }

            if (ratingdto.Stars < 1 || ratingdto.Stars > 5)
            {
                return BadRequest("stars must be between 1 and 5");
            }
            // check if the user has already rated the course 
            var existingrating = await _context.Rating
                .FirstOrDefaultAsync(x => x.CourseId == ratingdto.CourseId && x.StudentId == UserId);
            if (existingrating != null)
            {
                return BadRequest("User has already rated this course");
            }
            var rating = new Rating
            {
                StudentId = UserId,
                CourseId = ratingdto.CourseId,
                Stars = ratingdto.Stars,
                Review = ratingdto.Review,
                RatingDate = DateTime.UtcNow
            };
            _context.Rating.Add(rating);
            await _context.SaveChangesAsync();

            await UpdateCourseAverage(rating.CourseId);
           
            await _context.Entry(rating)
                .Reference(r =>r.student).LoadAsync();
            await _context.Entry(rating)
                .Reference(r =>r.Course).LoadAsync();

            var responsedto = new RatingResponseDto
            {
                Id = rating.Id,
                StudentId= UserId,
                StudentName=rating.student.Name,
                CourseId= rating.CourseId,
                CourseName=rating.Course.Name,
                Stars= rating.Stars,
                Review= rating.Review,
                RatingDate= rating.RatingDate,
                
            };

            return CreatedAtAction("GetRating", new { id = rating.Id }, responsedto);
        }

        // DELETE: api/Ratings/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRating(int id)
        {
            var rating = await _context.Rating.FindAsync(id);
            if (rating == null)
            {
                return NotFound();
            }

            _context.Rating.Remove(rating);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool RatingExists(int id)
        {
            return _context.Rating.Any(e => e.Id == id);
        }

        private async Task UpdateCourseAverage(int courseId)
        {
            var course = await _context.courses.FindAsync(courseId);
            if (course != null)
            {
                var averagerating = await _context.Rating
                    .Where(r => r.CourseId == courseId)
                    .AverageAsync(r => r.Stars);
                course.AverageRating = averagerating;
                await _context.SaveChangesAsync();
            }
        }
    }
}
