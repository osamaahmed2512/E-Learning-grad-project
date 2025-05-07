using GraduationProject.data;
using GraduationProject.models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GraduationProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TimerStateController : ControllerBase
    {
        private readonly AppDBContext _context;
        public TimerStateController(AppDBContext context)
        {
            _context = context;
        }

        // GET: api/TimerState/{userId}
        [HttpGet("{userId}")]
        public async Task<ActionResult<TimerState>> GetTimerState(int userId)
        {
            var state = await _context.TimerStates
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (state == null)
            {
                return NotFound();
            }

            return state;
        }

        // POST: api/TimerState
        [HttpPost]
        public async Task<ActionResult<TimerState>> CreateTimerState(TimerState state)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Verify User exists
            var user = await _context.Users.FindAsync(state.UserId);
            if (user == null)
            {
                return BadRequest("Invalid UserId");
            }

            state.LastUpdated = DateTime.UtcNow;
            _context.TimerStates.Add(state);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTimerState), new { userId = state.UserId }, state);
        }

        // PUT: api/TimerState/{userId}
        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateTimerState(int userId, TimerState state)
        {
            if (userId != state.UserId)
            {
                return BadRequest();
            }

            var existingState = await _context.TimerStates
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (existingState == null)
            {
                return NotFound();
            }

            existingState.RemainingTime = state.RemainingTime;
            existingState.IsPlaying = state.IsPlaying;
            existingState.Mode = state.Mode;
            existingState.LastUpdated = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TimerStateExists(userId))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/TimerState/{userId}
        [HttpDelete("{userId}")]
        public async Task<IActionResult> DeleteTimerState(int userId)
        {
            var state = await _context.TimerStates
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (state == null)
            {
                return NotFound();
            }

            _context.TimerStates.Remove(state);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TimerStateExists(int userId)
        {
            return _context.TimerStates.Any(e => e.UserId == userId);
        }
    }
}
