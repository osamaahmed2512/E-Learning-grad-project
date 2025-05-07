using GraduationProject.data;
using GraduationProject.models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GraduationProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TimerSettingsController : ControllerBase
    {
        private readonly AppDBContext _context;
        public TimerSettingsController(AppDBContext context)
        {
            _context = context;
        }

        
        [HttpGet("{userId}")]
        public async Task<ActionResult<TimerSettings>> GetTimerSettings(int userId)
        {
            var settings = await _context.TimerSettings
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (settings == null)
            {
                return NotFound("timer setting not found");
            }

            return settings;
        }

        // POST: api/TimerSettings
        [HttpPost]
        public async Task<ActionResult<TimerSettings>> CreateTimerSettings(TimerSettings settings)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Verify User exists
            var user = await _context.Users.FindAsync(settings.UserId);
            if (user == null)
            {
                return BadRequest("Invalid UserId");
            }

            settings.LastUpdated = DateTime.UtcNow;
            _context.TimerSettings.Add(settings);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTimerSettings), new { userId = settings.UserId }, settings);
        }

        // PUT: api/TimerSettings/{userId}
        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateTimerSettings(int userId, TimerSettings settings)
        {
            if (userId != settings.UserId)
            {
                return BadRequest();
            }

            var existingSettings = await _context.TimerSettings
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (existingSettings == null)
            {
                return NotFound();
            }

            existingSettings.WorkDuration = settings.WorkDuration;
            existingSettings.ShortBreakDuration = settings.ShortBreakDuration;
            existingSettings.LongBreakDuration = settings.LongBreakDuration;
            existingSettings.CustomWorkDuration = settings.CustomWorkDuration;
            existingSettings.CustomBreakDuration = settings.CustomBreakDuration;
            existingSettings.ActiveMode = settings.ActiveMode;
            existingSettings.LastUpdated = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TimerSettingsExists(userId))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        private bool TimerSettingsExists(int userId)
        {
            return _context.TimerSettings.Any(e => e.UserId == userId);
        }
    }
}
