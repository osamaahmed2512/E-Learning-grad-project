using System.Text.Json;

namespace GraduationProject.models
{
    public class JsonSnakeCaseNamingPolicy: JsonNamingPolicy
    {
        public override string ConvertName(string name)
        {
            return string.Concat(name.Select((x, i) => i > 0 && char.IsUpper(x)
                ? "_" + char.ToLower(x)
                : x.ToString())).ToLower();
        }
    }
}
