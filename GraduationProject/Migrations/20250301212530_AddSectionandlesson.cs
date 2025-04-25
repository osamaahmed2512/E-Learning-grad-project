using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GraduationProject.Migrations
{
    /// <inheritdoc />
    public partial class AddSectionandlesson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Lesson_courses_CourseId",
                table: "Lesson");

            migrationBuilder.RenameColumn(
                name: "CourseId",
                table: "Lesson",
                newName: "SectionId");

            migrationBuilder.RenameIndex(
                name: "IX_Lesson_CourseId",
                table: "Lesson",
                newName: "IX_Lesson_SectionId");

            migrationBuilder.CreateTable(
                name: "Sections",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CourseId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Sections_courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Sections_CourseId",
                table: "Sections",
                column: "CourseId");
            // Create default sections for existing courses
            migrationBuilder.Sql(@"
    INSERT INTO Sections (Name, CourseId)
    SELECT 'Default Section', Id FROM courses;
");

            // Assign existing lessons to the default section
            migrationBuilder.Sql(@"
    UPDATE Lesson
    SET SectionId = (SELECT TOP 1 Id FROM Sections WHERE CourseId = Lesson.SectionId);
");

            migrationBuilder.AddForeignKey(
                name: "FK_Lesson_Sections_SectionId",
                table: "Lesson",
                column: "SectionId",
                principalTable: "Sections",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Lesson_Sections_SectionId",
                table: "Lesson");

            migrationBuilder.DropTable(
                name: "Sections");

            migrationBuilder.RenameColumn(
                name: "SectionId",
                table: "Lesson",
                newName: "CourseId");

            migrationBuilder.RenameIndex(
                name: "IX_Lesson_SectionId",
                table: "Lesson",
                newName: "IX_Lesson_CourseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Lesson_courses_CourseId",
                table: "Lesson",
                column: "CourseId",
                principalTable: "courses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
