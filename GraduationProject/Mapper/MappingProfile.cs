using AutoMapper;
using GraduationProject.Dto;
using GraduationProject.models;

namespace GraduationProject.Mapper
{
    public class MappingProfile:Profile
    {
        public MappingProfile()
        {
            CreateMap<TimerSettingDto, TimerSettings>()
                .ForMember(dest =>dest.LastUpdated , opt => opt.MapFrom(src =>DateTime.Now));
            CreateMap<TimerStateDto, TimerState>();
            CreateMap<UpdateTimerStateDto,TimerState>();
            CreateMap<FocusSession, FocusSessionDto>();
            CreateMap<FocusSessionDto, FocusSession>();
        }
    }
}
