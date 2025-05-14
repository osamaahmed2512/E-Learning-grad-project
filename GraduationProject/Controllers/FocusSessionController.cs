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
    public class FocusSessionController : ControllerBase
    {
        private readonly AppDBContext _context;
        private readonly IMapper _mapper;

        public FocusSessionController(AppDBContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet("today")]
        public async Task<ActionResult<FocusSessionDto>> GetTodaySession()
        {
            var userId = int.Parse(User.FindFirst("Id")?.Value);
            var today = DateTime.UtcNow.Date;

            var session = await _context.focusSessions
                .FirstOrDefaultAsync(s => s.UserId == userId && s.Date.Date == today);

            if (session == null)
            {
                session = new FocusSession
                {
                    UserId = userId,
                    Date = today,
                    WorkMinutes = 0,
                    BreakMinutes = 0
                };
                _context.focusSessions.Add(session);
                await _context.SaveChangesAsync();
            }

            return Ok(_mapper.Map<FocusSessionDto>(session));
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateSessionTime([FromBody] UpdateSessionTimeDto dto)
        {
            var userId = int.Parse(User.FindFirst("Id")?.Value);
            var today = DateTime.UtcNow.Date;

            var session = await _context.focusSessions
                .FirstOrDefaultAsync(s => s.UserId == userId && s.Date.Date == today);

            if (session == null)
            {
                session = new FocusSession
                {
                    UserId = userId,
                    Date = today,
                    WorkMinutes = 0,
                    BreakMinutes = 0
                };
                _context.focusSessions.Add(session);
            }

            if (dto.IsWorkTime)
            {
                session.WorkMinutes += dto.Minutes;
            }
            else
            {
                session.BreakMinutes += dto.Minutes;
            }

            session.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                workMinutes = session.WorkMinutes,
                breakMinutes = session.BreakMinutes
            });
        }
    }
}
