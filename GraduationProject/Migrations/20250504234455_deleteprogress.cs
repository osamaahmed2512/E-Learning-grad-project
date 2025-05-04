using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GraduationProject.Migrations
{
    /// <inheritdoc />
    public partial class deleteprogress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VideoProgress");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "VideoProgress",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LessonId = table.Column<int>(type: "int", nullable: false),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    LastWatched = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TotalDuration = table.Column<float>(type: "real", nullable: false),
                    WatchedDuration = table.Column<float>(type: "real", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VideoProgress", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VideoProgress_Lesson_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lesson",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_VideoProgress_User_StudentId",
                        column: x => x.StudentId,
                        principalTable: "User",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_VideoProgress_LessonId",
                table: "VideoProgress",
                column: "LessonId");

            migrationBuilder.CreateIndex(
                name: "IX_VideoProgress_StudentId",
                table: "VideoProgress",
                column: "StudentId");
        }
    }
}
