//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Threading.Tasks;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;
//using GraduationProject.data;
//using GraduationProject.models;
//using GraduationProject.Dto;

//namespace GraduationProject.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class LessonTagsController : ControllerBase
//    {
//        private readonly AppDBContext _context;

//        public LessonTagsController(AppDBContext context)
//        {
//            _context = context;
//        }

//        // GET: api/LessonTags
//        [HttpGet]
//        public async Task<ActionResult<IEnumerable<object>>> GetAllLessonTags()
//        {
//            var lessonTags = await _context.LessonTag
//                .Include(lt => lt.Lesson)
//                .Include(lt => lt.Tag)
//                .Select(lt => new
//                {
//                    lt.LessonId,
//                    LessonTitle = lt.Lesson.Name,
//                    lt.TagId,
//                    TagName = lt.Tag.Name
//                })
//                .ToListAsync();

//            return Ok(lessonTags);
//        }

//        // GET: api/LessonTags/lessonId/tagId
//        [HttpGet("{lessonId:int}/{tagId:int}")]
//        public async Task<ActionResult<object>> GetLessonTag(int lessonId, int tagId)
//        {
//            var lessonTag = await _context.LessonTag
//                .Include(lt => lt.Lesson)
//                .Include(lt => lt.Tag)
//                .FirstOrDefaultAsync(lt => lt.LessonId == lessonId && lt.TagId == tagId);

//            if (lessonTag == null)
//            {
//                return NotFound(new { Message = "LessonTag not found" });
//            }

//            return Ok(new
//            {
//                lessonTag.LessonId,
//                LessonTitle = lessonTag.Lesson.Name,
//                lessonTag.TagId,
//                TagName = lessonTag.Tag.Name
//            });
//        }
//        [HttpPut("{lessonId}/{tagId}")]
//        public async Task<IActionResult> UpdateLessonTag(int lessonId, int tagId, [FromBody] UpdateLessonTagDto updateDto)
//        {
//            var lessonTag = await _context.LessonTag
//                .FirstOrDefaultAsync(lt => lt.LessonId == lessonId && lt.TagId == tagId);

//            if (lessonTag == null)
//            {
//                return NotFound(new { Message = "LessonTag not found" });
//            }

//            // Delete the old lesson tag
//            _context.LessonTag.Remove(lessonTag);

//            // Add a new lesson tag with the updated TagId
//            var newLessonTag = new LessonTag
//            {
//                LessonId = updateDto.LessonId,
//                TagId = updateDto.TagId
//            };

//            _context.LessonTag.Add(newLessonTag);

//            try
//            {
//                await _context.SaveChangesAsync();
//            }
//            catch (DbUpdateConcurrencyException)
//            {
//                return StatusCode(StatusCodes.Status500InternalServerError, "Update failed");
//            }

//            return Ok(new { Message = "LessonTag updated successfully" });
//        }


//        [HttpPost]
//        public async Task<IActionResult> AddLessonTag([FromBody] LessonTagDto lessonTagDto)
//        {
//            if (lessonTagDto.LessonId <= 0 || lessonTagDto.TagId <= 0)
//            {
//                return BadRequest(new { Message = "LessonId and TagId are required and must be greater than zero" });
//            }

//            var existingLessonTag = await _context.LessonTag
//                .AnyAsync(lt => lt.LessonId == lessonTagDto.LessonId && lt.TagId == lessonTagDto.TagId);

//            if (existingLessonTag)
//            {
//                return Conflict(new { Message = "LessonTag already exists" });
//            }

//            var lessonTag = new LessonTag
//            {
//                LessonId = lessonTagDto.LessonId,
//                TagId = lessonTagDto.TagId
//            };

//            _context.LessonTag.Add(lessonTag);

//            try
//            {
//                await _context.SaveChangesAsync();
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(StatusCodes.Status500InternalServerError, $"Error saving data: {ex.Message}");
//            }

//            return CreatedAtAction(nameof(GetLessonTag), new { lessonId = lessonTag.LessonId, tagId = lessonTag.TagId }, lessonTag);
//        }

//        // DELETE: api/LessonTags/lessonId/tagId
//        [HttpDelete("{lessonId:int}/{tagId:int}")]
//        public async Task<IActionResult> DeleteLessonTag(int lessonId, int tagId)
//        {
//            var lessonTag = await _context.LessonTag
//                .FirstOrDefaultAsync(lt => lt.LessonId == lessonId && lt.TagId == tagId);

//            if (lessonTag == null)
//            {
//                return NotFound(new { Message = "LessonTag not found" });
//            }

//            _context.LessonTag.Remove(lessonTag);
//            await _context.SaveChangesAsync();

//            return Ok(new { Message = "LessonTag deleted successfully" });
//        }

//        private bool LessonTagExists(int lessonId, int tagId)
//        {
//            return _context.LessonTag.Any(e => e.LessonId == lessonId && e.TagId == tagId);
//        }
//    }
//}
