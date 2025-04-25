namespace GraduationProject.Helpers
{
    public static class SaveFile
    {
        internal static async Task<string> SaveandUploadFile(IFormFile file, string folderName)
        {
            if (file == null || file.Length == 0)
            {
                return null;
            }

            // Create the folder if it doesn't exist
            var uploadsFolder = Path.Combine("wwwroot", folderName);
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // Generate a unique file name
            var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // Save the file to the server
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            // Return the file path (relative to wwwroot)
            return $"/{folderName}/{uniqueFileName}";
        }
    }
}
