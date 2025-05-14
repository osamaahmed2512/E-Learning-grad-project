using AutoMapper;
using GraduationProject.data;
using GraduationProject.Dto;
using GraduationProject.models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GraduationProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize("StudentPolicy")]
    public class TimerStateController : ControllerBase
    {
        private readonly AppDBContext _context;
        private readonly IMapper _mapper;
        public TimerStateController(AppDBContext context , IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        
        [HttpGet]
        public async Task<ActionResult<TimerState>> GetTimerState()
        {
            var userId = int.Parse(User.FindFirst("Id")?.Value);
            var state = await _context.TimerStates
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (state == null)
            {
                return NotFound("timer state not found ");
            }

            return state;
        }

        // POST: api/TimerState
        [HttpPost]
        public async Task<ActionResult<TimerState>> CreateTimerState(TimerStateDto dto )
        {
            var userId = int.Parse(User.FindFirst("Id")?.Value);
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var existingState = await _context.TimerStates
    .                FirstOrDefaultAsync(s => s.UserId == userId);

            if (existingState != null)
            {
                return BadRequest(new { Message = "Timer state already exists for this user. Use PUT to update." });
            }
            var state = _mapper.Map<TimerState>(dto);
            state.UserId = userId;
            _context.TimerStates.Add(state);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTimerState), new { userId = userId }, state);
        }

        // PUT: api/TimerState/{userId}
        [HttpPut]
        public async Task<IActionResult> UpdateTimerState( UpdateTimerStateDto dto)
        {
            var userId = int.Parse(User.FindFirst("Id")?.Value);
            if (userId != dto.UserId)
            {
                return BadRequest("youcannot update Sstate of another person ");
            }

            var existingState = await _context.TimerStates
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (existingState == null)
            {
                return NotFound("timer state not found");
            }
            _mapper.Map(dto, existingState);

            //existingState.RemainingTime = state.RemainingTime;
            //existingState.IsPlaying = state.IsPlaying;
            //existingState.Mode = state.Mode;
            //existingState.LastUpdated = DateTime.UtcNow;

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
        [HttpDelete]
        public async Task<IActionResult> DeleteTimerState()
        {
            var userId = int.Parse(User.FindFirst("Id")?.Value);
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
        // Add this method to TimerStateController
        [HttpPost("complete-interval")]
        public async Task<IActionResult> CompleteInterval([FromBody] CompleteIntervalDto dto)
        {
            var userId = int.Parse(User.FindFirst("Id")?.Value);
            var currentTime = DateTime.UtcNow;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Update timer state
                var timerState = await _context.TimerStates
                    .FirstOrDefaultAsync(s => s.UserId == userId);

                if (timerState != null)
                {
                    timerState.LastUpdated = currentTime;
                }

                // Update focus session
                var focusSession = await _context.focusSessions
                    .FirstOrDefaultAsync(f => f.UserId == userId && f.Date.Date == currentTime.Date);

                if (focusSession == null)
                {
                    focusSession = new FocusSession
                    {
                        UserId = userId,
                        Date = currentTime.Date,
                        WorkMinutes = 0,
                        BreakMinutes = 0
                    };
                    _context.focusSessions.Add(focusSession);
                }

                if (dto.IsWorkTime)
                {
                    focusSession.WorkMinutes += dto.Minutes;
                }
                else
                {
                    focusSession.BreakMinutes += dto.Minutes;
                }

                focusSession.UpdatedAt = currentTime;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    workMinutes = focusSession.WorkMinutes,
                    breakMinutes = focusSession.BreakMinutes
                });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        private bool TimerStateExists(int userId)
        {
            return _context.TimerStates.Any(e => e.UserId == userId);
        }
    }
}
