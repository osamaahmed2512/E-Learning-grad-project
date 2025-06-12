using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GraduationProject.data;
using GraduationProject.models;
using Microsoft.AspNetCore.Authorization;
using GraduationProject.Dto;


namespace GraduationProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LessonController : ControllerBase
    {
        private readonly AppDBContext _context;
        public LessonController(AppDBContext context)
        {
            _context = context;
        }

        // GET: api/Lesson
        [HttpGet]

        public async Task<ActionResult<IEnumerable<Lesson>>> GetAllLessons()
        {
            var lessons = await _context.Lesson
        .Select(l => new
        {
            l.Id,
            l.Name,
            l.Description,
            l.FileBath,
            l.SectionId,
            //Tags = l.LessonTags.Select(x =>x.Tag.Name).ToList()
        })
        .ToListAsync();

            return Ok(lessons);
        }

        // GET: api/Lesson/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Lesson>> GetLesson(int id)
        {
            var lesson = await _context.Lesson
                .FirstOrDefaultAsync(I =>I.Id ==id);

          
            if (lesson == null)
            {
                return NotFound(new { Message = "Lessons not found" });
            }
          
            var LessonDto = new
            {
                lesson.Id,
                lesson.Name,
                lesson.Description,
                lesson.FileBath,
                lesson.SectionId,
                lesson.DurationInHours

            };
            return Ok(LessonDto);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "InstructorAndAdminPolicy")]
        public async Task<IActionResult> UpdateLesson(int id, [FromForm] UpdateLesson lessonDto)
        {
            var lesson = await _context.Lesson.Include(l =>l.Section).
                FirstOrDefaultAsync(x => x.Id == id);
            if (lesson == null)
            {
                return NotFound(new { Message = "Lesson not found" });
            }
            var userId = int.Parse(User.FindFirst("Id")?.Value);
            if (lesson.UserId != userId)
            {
                return Unauthorized(new { Message = "You can only update your own lesson" });
            }

            // Update fields only if new values are provided
            if (!string.IsNullOrEmpty(lessonDto.Title))
            {
                lesson.Name = lessonDto.Title;
            }


            if (!string.IsNullOrEmpty(lessonDto.Description))
            {
                lesson.Description = lessonDto.Description;
            }

            if (lessonDto.SectionId !=null)
            {
                lesson.SectionId = lessonDto.SectionId.Value;
            }
            if (lessonDto.IsPreview.HasValue)
            {
                lesson.IsPreview = lessonDto.IsPreview.Value;
            }
            // Update video if provided
            if (lessonDto.video != null && lessonDto.video.Length > 0)
            {
                //var oldFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot" + lesson.FileBath);
                //if (System.IO.File.Exists(oldFilePath))
                //{
                //    System.IO.File.Delete(oldFilePath);
                //}

                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/videos");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(lessonDto.video.FileName);
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await lessonDto.video.CopyToAsync(stream);
                }
                try
                {
                    using (var file = TagLib.File.Create(filePath))
                    {
                        lesson.DurationInHours = file.Properties.Duration.TotalHours;
                    }
                }
                catch (Exception ex)
                {
                    // Log the error but don't fail the update
                    Console.WriteLine($"Error calculating video duration: {ex.Message}");
                    // Optionally set a default duration or keep the existing one
                    lesson.DurationInHours = 0;
                }

                lesson.FileBath = $"/videos/{uniqueFileName}";
            }

            try
            {
                await _context.SaveChangesAsync();
                if (lesson.Section?.CourseId != null)
                {
                    await UpdateCourseHours(lesson.Section.CourseId);
                }
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LessonExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { Message = "Lesson updated successfully" });
        }


        [HttpPost]
        [Authorize(Policy = "InstructorAndAdminPolicy")]
        public async Task<ActionResult<Lesson>> Addlesson([FromForm] LessonDto lessonDto)
        {
            if (lessonDto.video == null || lessonDto.video.Length == 0)
            {
                return BadRequest(new { Message = "Please upload a video file." });
            }
            var section = await _context.Sections
                    .Include(s => s.Course)
                    .FirstOrDefaultAsync(s => s.Id == lessonDto.SectionId);

            if (section == null)
            {
                return BadRequest(new { Message = "Invalid SectionId. The specified Section does not exist." });
            }


            // Save the uploaded video file
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/videos");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(lessonDto.video.FileName);
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await lessonDto.video.CopyToAsync(stream);
            }

            // Get video duration
            double lessonDurationHours;
            try
            {
                using (var file = TagLib.File.Create(filePath))
                {
                    lessonDurationHours = file.Properties.Duration.TotalHours;
                }
            }
            catch (Exception)
            {
                lessonDurationHours = 0; // Default if unable to get duration
            }
            var userId = int.Parse(User.FindFirst("Id")?.Value);

            var lesson = new Lesson
            {
                Name = lessonDto.Title,
                Description = lessonDto.Description,
                FileBath = $"/videos/{uniqueFileName}",
                // Relative path for the saved file
                SectionId = lessonDto.SectionId,
                //LessonTags = new List<LessonTag>()
                DurationInHours = lessonDurationHours,
                UserId = userId,
                IsPreview=lessonDto.IsPreview
            };


            _context.Lesson.Add(lesson);
            await _context.SaveChangesAsync();
            // Update course hours
            await UpdateCourseHours(section.Course.Id);


            return CreatedAtAction("GetLesson", new { id = lesson.Id }, new
            {
                lesson.Id,
                lesson.Name,
                lesson.Description,
                lesson.SectionId,
                videoPath = lesson.FileBath,
                //Tags = lesson.LessonTags.Select(lt => lt.Tag.Name)
            });
        }
      
       


        // DELETE: api/Lesson/5
        
        [HttpDelete("{id}")]
        [Authorize(Policy = "InstructorAndAdminPolicy")]
        public async Task<IActionResult> DeleteLesson(int id)
        {
            var userId = int.Parse(User.FindFirst("Id")?.Value);

            var lesson = await _context.Lesson.Include(l =>l.Section).FirstOrDefaultAsync(l=>l.Id==id);
            if (lesson?.UserId != userId)
            {
                return Unauthorized("you are not authorized to perform this action");
            }
            if (lesson == null)
            {
                return NotFound(new {Message="Lesson not found"});
            }
            int? courseId = lesson.Section?.CourseId;
            _context.Lesson.Remove(lesson);
            await _context.SaveChangesAsync();
            if (courseId.HasValue)
            {
                await UpdateCourseHours(courseId.Value);
            }

            return Ok(new {Message = "Lesson deleted succesfully"});
        }

  
        private bool LessonExists(int id)
        {
            return _context.Lesson.Any(e => e.Id == id);
        }

        [HttpPost("update")]
        [Authorize("StudentPolicy")]
        public async Task<IActionResult> UpdateProgress([FromBody] LessonProgressDto dto)
        {
            // First verify that the lesson exists
            var lesson = await _context.Lesson.FindAsync(dto.LessonId);
            if (lesson == null)
            {
                return NotFound(new { Message = $"Lesson with ID {dto.LessonId} not found" });
            }

            var currentUserId = int.Parse(User.FindFirst("Id")?.Value);

            var progress = await _context.LessonProgress
                .FirstOrDefaultAsync(x => x.UserId == currentUserId && x.LessonId == dto.LessonId);

            if (progress == null)
            {
                progress = new LessonProgress
                {
                    UserId = currentUserId,
                    LessonId = dto.LessonId,
                    WatchedSeconds = dto.WatchedSeconds,
                    LastUpdated = DateTime.UtcNow
                };
                _context.LessonProgress.Add(progress);
            }
            else
            {
                if (dto.WatchedSeconds > progress.WatchedSeconds) // Always save max watched time
                {
                    progress.WatchedSeconds = dto.WatchedSeconds;
                    progress.LastUpdated = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();

            await UpdateCourseProgress(currentUserId, dto.LessonId);

            return Ok();
        }
        [HttpPost("recalculate-all-course-hours")]

        public async Task<IActionResult> RecalculateAllCourseHours()
        {
            var courses = await _context.courses.ToListAsync();
            foreach (var course in courses)
            {
                await UpdateCourseHours(course.Id);
            }
            return Ok(new { Message = "All course hours have been recalculated" });
        }
        private async Task UpdateCourseProgress(int userId, int lessonId)
        {
            var lesson = await _context.Lesson.Include(l => l.Section).FirstAsync(l => l.Id == lessonId);
            
            var courseId = lesson.Section.CourseId;

            var courseLessons = await _context.Lesson
                .Where(l => l.Section.CourseId == courseId)
                .ToListAsync();

            var userProgress = await _context.LessonProgress
                .Where(lp => lp.UserId == userId && courseLessons.Select(l => l.Id).Contains(lp.LessonId))
                .ToListAsync();

            var totalWatchedHours = userProgress.Sum(lp => (lp.WatchedSeconds / 3600.0));

            var course = await _context.courses.FirstAsync(c => c.Id == courseId);
            var completionPercentage = (totalWatchedHours / course.No_of_hours) * 100;

            var rating = await _context.Rating
                .FirstOrDefaultAsync(r => r.StudentId == userId && r.CourseId == courseId);

            if (rating == null)
            {
                rating = new Rating
                {
                    StudentId = userId,
                    CourseId = courseId
                };
                _context.Rating.Add(rating);
            }

            rating.TimeSpentHours = totalWatchedHours;
            rating.CompletionStatus = completionPercentage >=92? "Yes" : "No";

            await _context.SaveChangesAsync();
        }

        [HttpGet("progress/{lessonId}")]
        [Authorize("StudentPolicy")]
        public async Task<IActionResult> GetLessonProgress(int lessonId)
        {
            var currentUserId = int.Parse(User.FindFirst("Id")?.Value);

            var progress = await _context.LessonProgress
                .FirstOrDefaultAsync(x => x.UserId == currentUserId && x.LessonId == lessonId);

            if (progress == null)
            {
                return Ok(new { WatchedSeconds = 0 });
            }

            return Ok(new { progress.WatchedSeconds });
        }
        
        private async Task UpdateCourseHours(int courseId)
        {
            var course = await _context.courses
                .Include(c => c.Sections)
                .ThenInclude(s => s.Lessons)
                .FirstOrDefaultAsync(c => c.Id == courseId);

            if (course != null)
            {
                // Calculate total hours directly without rounding
                double totalHours = await _context.Lesson
                    .Include(l => l.Section)
                    .Where(l => l.Section.CourseId == courseId)
                    .SumAsync(l => l.DurationInHours);

                course.No_of_hours = totalHours; // Store exact hours without rounding
                await _context.SaveChangesAsync();
            }
        }
    
    }

}
