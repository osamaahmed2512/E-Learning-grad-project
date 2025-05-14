using AutoMapper;
using GraduationProject.data;
using GraduationProject.Dto;
using GraduationProject.models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GraduationProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize("StudentPolicy")]
    public class TimerSettingsController : ControllerBase
    {
        private readonly AppDBContext _context;
        private readonly IMapper _mapper;
        public TimerSettingsController(AppDBContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        
        [HttpGet]
        public async Task<ActionResult<TimerSettings>> GetTimerSettings()
        {
            var userId = int.Parse(User.FindFirst("Id")?.Value);
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

        public async Task<ActionResult<TimerSettings>> CreateTimerSettings(TimerSettingDto dto)
        {
            var userId = int.Parse(User.FindFirst("Id")?.Value);
            var existingSettings = await _context.TimerSettings
    .FirstOrDefaultAsync(s => s.UserId == userId);

            if (existingSettings != null)
            {
                return BadRequest(new { Message = "Settings already exist for this user. Use PUT to update." });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
           
           
           


          var setting=_mapper.Map<TimerSettings>(dto);
            setting.UserId = userId;
            _context.TimerSettings.Add(setting);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTimerSettings), new { userId = setting.UserId }, setting);
        }


        [HttpPut]
        public async Task<IActionResult> UpdateTimerSettings( TimerSettingDto settings)
        {
            var userId = int.Parse(User.FindFirst("Id")?.Value);


            var existingSettings = await _context.TimerSettings
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (existingSettings == null)
            {
                return NotFound("setting not found");
            }
            _mapper.Map(settings, existingSettings);

            //existingSettings.WorkDuration = settings.WorkDuration;
            //existingSettings.ShortBreakDuration = settings.ShortBreakDuration;
            //existingSettings.LongBreakDuration = settings.LongBreakDuration;
            //existingSettings.CustomWorkDuration = settings.CustomWorkDuration;
            //existingSettings.CustomBreakDuration = settings.CustomBreakDuration;
            //existingSettings.ActiveMode = settings.ActiveMode;
            //existingSettings.LastUpdated = DateTime.UtcNow;

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
