//using GraduationProject.data;
//using GraduationProject.Dto;
//using GraduationProject.models;
//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;

//namespace GraduationProject.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    [Authorize("StudentPolicy")]
//    public class PomodoroController : ControllerBase
//    {
//        private readonly AppDBContext _context;

//        public PomodoroController(AppDBContext context)
//        {
//            _context = context;
//        }

//        // GET: api/Pomodoro/sessions
//        [HttpGet("sessions")]
//        public async Task<ActionResult<IEnumerable<PomodoroSession>>> GetUserSessions()
//        {
//            var userId = int.Parse(User.FindFirst("Id")?.Value);

//            return await _context.PomodoroSessions
//                .Where(s => s.UserId == userId)
//                .OrderByDescending(s => s.StartTime)
//                .Take(50) // Limit to last 50 sessions
//                .ToListAsync();
//        }

//        // POST: api/Pomodoro/start
//        [HttpPost("start")]
//        public async Task<ActionResult<PomodoroSession>> StartSession(StartPomodoroSessionDto dto)
//        {
//            var userId = int.Parse(User.FindFirst("Id")?.Value);

//            var session = new PomodoroSession
//            {
//                UserId = userId,
//                StartTime = DateTime.UtcNow,
//                SessionType = dto.SessionType,
//                Duration = dto.Duration,
//                Notes = dto.Notes,
//                IsCompleted = false
//            };

//            _context.PomodoroSessions.Add(session);
//            await _context.SaveChangesAsync();

//            return CreatedAtAction(nameof(GetSession), new { id = session.Id }, session);
//        }

//        // GET: api/Pomodoro/5
//        [HttpGet("{id}")]
//        public async Task<ActionResult<PomodoroSession>> GetSession(int id)
//        {
//            var userId = int.Parse(User.FindFirst("Id")?.Value);

//            var session = await _context.PomodoroSessions
//                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

//            if (session == null)
//            {
//                return NotFound();
//            }

//            return session;
//        }

//        // PUT: api/Pomodoro/5
//        [HttpPut("{id}")]
//        public async Task<IActionResult> UpdateSession(int id, UpdatePomodoroSessionDto dto)
//        {
//            var userId = int.Parse(User.FindFirst("Id")?.Value);

//            var session = await _context.PomodoroSessions
//                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

//            if (session == null)
//            {
//                return NotFound();
//            }

//            session.CompletedDuration = dto.CompletedDuration;
//            session.IsCompleted = dto.IsCompleted;
//            session.Notes = dto.Notes;
//            session.EndTime = dto.IsCompleted ? DateTime.UtcNow : null;
//            session.UpdatedAt = DateTime.UtcNow;

//            try
//            {
//                await _context.SaveChangesAsync();
//            }
//            catch (DbUpdateConcurrencyException)
//            {
//                if (!SessionExists(id))
//                {
//                    return NotFound();
//                }
//                else
//                {
//                    throw;
//                }
//            }

//            return NoContent();
//        }

//        // GET: api/Pomodoro/stats
//        [HttpGet("stats")]
//        public async Task<ActionResult<PomodoroStatsDto>> GetStats([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
//        {
//            var userId = int.Parse(User.FindFirst("Id")?.Value);

//            var query = _context.PomodoroSessions
//                .Where(s => s.UserId == userId);

//            if (startDate.HasValue)
//                query = query.Where(s => s.StartTime >= startDate.Value);
//            if (endDate.HasValue)
//                query = query.Where(s => s.StartTime <= endDate.Value);

//            var sessions = await query.ToListAsync();

//            var stats = new PomodoroStatsDto
//            {
//                TotalSessions = sessions.Count,
//                CompletedSessions = sessions.Count(s => s.IsCompleted),
//                TotalMinutes = sessions.Where(s => s.IsCompleted)
//                    .Sum(s => s.CompletedDuration ?? 0),
//                SessionTypeBreakdown = sessions
//                    .GroupBy(s => s.SessionType)
//                    .ToDictionary(g => g.Key, g => g.Count()),
//                DailyStats = sessions
//                    .GroupBy(s => s.StartTime.Date)
//                    .Select(g => new DailyStatsDto
//                    {
//                        Date = g.Key,
//                        TotalSessions = g.Count(),
//                        CompletedMinutes = g.Where(s => s.IsCompleted)
//                            .Sum(s => s.CompletedDuration ?? 0)
//                    })
//                    .OrderByDescending(s => s.Date)
//                    .ToList()
//            };

//            return stats;
//        }

//        // POST: api/Pomodoro/settings
//        [HttpPost("settings")]
//        public async Task<IActionResult> SaveSettings(PomodoroSettingsDto settings)
//        {
//            var userId = int.Parse(User.FindFirst("Id")?.Value);
//            var user = await _context.Users.FindAsync(userId);

//            if (user == null)
//                return NotFound();

//            // Store settings in user preferences or a separate table
//            // For now, we'll store it as JSON in a user field
//            user.PreferredSettings = System.Text.Json.JsonSerializer.Serialize(settings);
//            await _context.SaveChangesAsync();

//            return Ok();
//        }

//        // GET: api/Pomodoro/settings
//        [HttpGet("settings")]
//        public async Task<ActionResult<PomodoroSettingsDto>> GetSettings()
//        {
//            var userId = int.Parse(User.FindFirst("Id")?.Value);
//            var user = await _context.Users.FindAsync(userId);

//            if (user == null)
//                return NotFound();

//            if (string.IsNullOrEmpty(user.PreferredSettings))
//            {
//                return new PomodoroSettingsDto(); // Return default settings
//            }

//            return System.Text.Json.JsonSerializer.Deserialize<PomodoroSettingsDto>(user.PreferredSettings);
//        }

//        private bool SessionExists(int id)
//        {
//            return _context.PomodoroSessions.Any(e => e.Id == id);
//        }
//    }
//}
