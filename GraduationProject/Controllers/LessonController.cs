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
        private const double COMPLETION_THRESHOLD = 0.8;
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
                //Tags = lesson.LessonTags.Select(lt => new
                //{
                //    lt.TagId,
                //    lt.Tag.Name
                //})

            };
            return Ok(LessonDto);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "InstructorAndAdminPolicy")]
        public async Task<IActionResult> UpdateLesson(int id, [FromForm] UpdateLesson lessonDto)
        {
            var lesson = await _context.Lesson.FirstOrDefaultAsync(x => x.Id == id);
            if (lesson == null)
            {
                return NotFound(new { Message = "Lesson not found" });
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

            // Update video if provided
            if (lessonDto.video != null && lessonDto.video.Length > 0)
            {
                var oldFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot" + lesson.FileBath);
                if (System.IO.File.Exists(oldFilePath))
                {
                    System.IO.File.Delete(oldFilePath);
                }

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

                lesson.FileBath = $"/videos/{uniqueFileName}";
            }

            //// Update tags only if provided
            //if (lessonDto.Tags != null && lessonDto.Tags.Any())
            //{
            //    lesson.LessonTags.Clear();

            //    foreach (var tagName in lessonDto.Tags)
            //    {
            //        var tag = await _context.Tags.FirstOrDefaultAsync(t => t.Name == tagName);
            //        if (tag == null)
            //        {
            //            tag = new Tag { Name = tagName };
            //            _context.Tags.Add(tag);
            //            await _context.SaveChangesAsync();
            //        }

            //        lesson.LessonTags.Add(new LessonTag { TagId = tag.Id });
            //    }
            //}

            // Save changes
            try
            {
                await _context.SaveChangesAsync();
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

        // POST: api/Lesson
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
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


            var lesson = new Lesson
            {
                Name = lessonDto.Title,
                Description = lessonDto.Description,
                FileBath = $"/videos/{uniqueFileName}",
                // Relative path for the saved file
                SectionId = lessonDto.SectionId,
                //LessonTags = new List<LessonTag>()
                DurationInHours = lessonDurationHours
            };

            //foreach (var tagName in lessonDto.Tags)
            //{
            //    var tag = await _context.Tags.FirstOrDefaultAsync(t => t.Name == tagName);
            //    if (tag == null)
            //    {
            //        tag = new Tag { Name = tagName };
            //        _context.Tags.Add(tag);
            //        await _context.SaveChangesAsync();
            //    }

            //    lesson.LessonTags.Add(new LessonTag { TagId = tag.Id });
            //}

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
        private async Task<bool> CheckCourseCompletion(int courseId, int userId)
        {
            // Get all lessons in the course
            var lessonsInCourse = await _context.Lesson
                .Include(l => l.Section)
                .Where(l => l.Section.CourseId == courseId)
                .ToListAsync();

            if (!lessonsInCourse.Any())
                return false;

            var totalCourseDuration = lessonsInCourse.Sum(l => l.DurationInHours);

            // Get user's watched time
            var rating = await _context.Rating
                .FirstOrDefaultAsync(r => r.CourseId == courseId && r.StudentId == userId);

            if (rating == null)
                return false;

            // Calculate completion percentage
            var completionPercentage = rating.TimeSpentHours / totalCourseDuration;

            // Return true if user has watched at least 80% of total course duration
            return completionPercentage >= COMPLETION_THRESHOLD;
        }


        // DELETE: api/Lesson/5
        [HttpDelete("{id}")]
        [Authorize(Policy = "InstructorAndAdminPolicy")]
        public async Task<IActionResult> DeleteLesson(int id)
        {
           
            var lesson = await _context.Lesson.FindAsync(id);
            if (lesson == null)
            {
                return NotFound(new {Message="Lesson not found"});
            }

            _context.Lesson.Remove(lesson);
            await _context.SaveChangesAsync();

            return Ok(new {Message = "Lesson deleted succesfully"});
        }
        [HttpPost("track-progress")]
        [Authorize]
        public async Task<IActionResult> TrackProgress([FromBody] VideoProgressUpdateDto progressDto)
        {
            try
            {
                var userIdClaim = User.FindFirst("Id");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized(new { Message = "User not authenticated" });
                }

                var lesson = await _context.Lesson
                    .Include(l => l.Section)
                    .FirstOrDefaultAsync(l => l.Id == progressDto.LessonId);

                if (lesson == null)
                {
                    return NotFound(new { Message = "Lesson not found" });
                }

                // Convert seconds to hours
                float watchedHours = progressDto.CurrentTime / 3600f;
                float totalHours = progressDto.TotalDuration / 3600f;

                // Get or create video progress
                var progress = await _context.VideoProgress
                    .FirstOrDefaultAsync(vp => vp.LessonId == progressDto.LessonId &&
                                             vp.StudentId == userId);

                if (progress == null)
                {
                    progress = new VideoProgress
                    {
                        StudentId = userId,
                        LessonId = progressDto.LessonId,
                        WatchedDuration = watchedHours,
                        TotalDuration = totalHours,
                        IsCompleted = progressDto.IsCompleted,
                        LastWatched = DateTime.UtcNow
                    };
                    _context.VideoProgress.Add(progress);
                }
                else
                {
                    progress.WatchedDuration = Math.Max(progress.WatchedDuration, watchedHours);
                    progress.IsCompleted = progressDto.IsCompleted;
                    progress.LastWatched = DateTime.UtcNow;
                }

                // Update Rating table for course-level progress
                var rating = await _context.Rating
                    .FirstOrDefaultAsync(r => r.StudentId == userId &&
                                            r.CourseId == lesson.Section.CourseId);

                if (rating == null)
                {
                    rating = new Rating
                    {
                        StudentId = userId,
                        CourseId = lesson.Section.CourseId,
                        TimeSpentHours = watchedHours,
                        ClickCount = 1,
                        CompletionStatus = "No",
                        RatingDate = DateTime.UtcNow
                    };
                    _context.Rating.Add(rating);
                }
                else
                {
                    rating.TimeSpentHours = Math.Max(rating.TimeSpentHours, watchedHours);
                    rating.ClickCount++;
                }

                await _context.SaveChangesAsync();

                // Calculate completion percentage
                float completionPercentage = (watchedHours / totalHours) * 100;
                bool isVideoCompleted = completionPercentage >= 90; // Consider 90% watched as completed

                return Ok(new
                {
                    Message = "Progress tracked successfully",
                    WatchedDuration = watchedHours,
                    TotalDuration = totalHours,
                    CompletionPercentage = completionPercentage,
                    IsCompleted = isVideoCompleted
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Error tracking progress", Error = ex.Message });
            }
        }

        [HttpGet("course-progress/{courseId}")]
        public async Task<IActionResult> GetDetailedCourseProgress(int courseId)
        {
            try
            {
                var userIdClaim = User.FindFirst("Id");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized(new { Message = "User not authenticated" });
                }

                // Get all lessons in the course
                var courseLessons = await _context.Lesson
                    .Include(l => l.Section)
                    .Where(l => l.Section.CourseId == courseId)
                    .ToListAsync();

                var totalCourseDuration = courseLessons.Sum(l => l.DurationInHours);

                // Get user's progress
                var rating = await _context.Rating
                    .FirstOrDefaultAsync(r => r.CourseId == courseId && r.StudentId == userId);

                if (rating == null)
                {
                    return Ok(new
                    {
                        TimeSpentHours = 0.0,
                        CompletionStatus = "No",
                        CompletionPercentage = 0.0,
                        TotalCourseDuration = totalCourseDuration,
                        IsCompleted = false
                    });
                }

                // Handle division by zero and invalid values
                double completionPercentage = 0.0;
                if (totalCourseDuration > 0)
                {
                    completionPercentage = Math.Min((rating.TimeSpentHours / totalCourseDuration) * 100, 100);
                }

                return Ok(new
                {
                    TimeSpentHours = double.IsInfinity(rating.TimeSpentHours) ? 0.0 : rating.TimeSpentHours,
                    CompletionStatus = rating.CompletionStatus,
                    CompletionPercentage = double.IsInfinity(completionPercentage) ? 0.0 : completionPercentage,
                    TotalCourseDuration = double.IsInfinity(totalCourseDuration) ? 0.0 : totalCourseDuration,
                    IsCompleted = completionPercentage >= COMPLETION_THRESHOLD * 100
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Error retrieving course progress", Error = ex.Message });
            }
        }

        [HttpGet("statistics/{lessonId}")]
        [Authorize]
        public async Task<IActionResult> GetLessonStatistics(int lessonId)
        {
            var lesson = await _context.Lesson
                .Include(l => l.Section)
                .FirstOrDefaultAsync(l => l.Id == lessonId);

            if (lesson == null)
            {
                return NotFound(new { Message = "Lesson not found" });
            }

            var progress = await _context.VideoProgress
                .Where(vp => vp.LessonId == lessonId)
                .ToListAsync();

            var stats = new
            {
                TotalStudents = progress.Count,
                CompletedCount = progress.Count(p => p.IsCompleted),
                AverageWatchedDuration = progress.Any() ? progress.Average(p => p.WatchedDuration) : 0,
                CompletionRate = progress.Any() ? (double)progress.Count(p => p.IsCompleted) / progress.Count * 100 : 0
            };

            return Ok(stats);
        }
        private bool LessonExists(int id)
        {
            return _context.Lesson.Any(e => e.Id == id);
        }

        private async Task SynchronizeVideoProgress(int userId, int courseId)
        {
            var allProgress = await _context.VideoProgress
                .Include(vp => vp.Lesson)
                .ThenInclude(l => l.Section)
                .Where(vp => vp.Lesson.Section.CourseId == courseId && vp.StudentId == userId)
                .ToListAsync();

            var rating = await _context.Rating
                .FirstOrDefaultAsync(r => r.CourseId == courseId && r.StudentId == userId);

            if (rating != null)
            {
                // Sum up all watched durations
                double totalWatchedHours = allProgress.Sum(vp => vp.WatchedDuration);

                // Update the rating if there's a discrepancy
                if (Math.Abs(rating.TimeSpentHours - totalWatchedHours) > 0.01) // Small threshold for float comparison
                {
                    rating.TimeSpentHours = totalWatchedHours;
                    await _context.SaveChangesAsync();
                }
            }
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
