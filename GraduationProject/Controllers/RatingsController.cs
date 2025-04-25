using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GraduationProject.data;
using GraduationProject.models;
using GraduationProject.Dto;

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

        // GET: api/Ratings/5
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

        // PUT: api/Ratings/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRating(int id, Rating rating)
        {
            if (id != rating.Id)
            {
                return BadRequest();
            }

            _context.Entry(rating).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RatingExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Ratings
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<RatingResponseDto>> AddRating(RatingCreateDto ratingdto)
        {
            var student = await _context.users.FirstOrDefaultAsync(u =>u.Id == ratingdto.StudentId);
            if (student == null)
            {
              return BadRequest($"user with id {ratingdto.StudentId} is not found");
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
                .FirstOrDefaultAsync(x => x.CourseId == ratingdto.CourseId && x.StudentId == ratingdto.StudentId);
            if (existingrating != null)
            {
                return BadRequest("User has already rated this course");
            }
            var rating = new Rating
            {
                StudentId = ratingdto.StudentId,
                CourseId = ratingdto.CourseId,
                Stars = ratingdto.Stars,
                Review = ratingdto.Review,
                RatingDate = DateTime.UtcNow,
                CompletionStatus = "No"
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
                StudentId= rating.StudentId,
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
