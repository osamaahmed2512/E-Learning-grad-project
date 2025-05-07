using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GraduationProject.Migrations
{
    /// <inheritdoc />
    public partial class addingpomodoro : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PomodoroSessions");

            migrationBuilder.CreateTable(
                name: "TimerSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    WorkDuration = table.Column<int>(type: "int", nullable: false),
                    ShortBreakDuration = table.Column<int>(type: "int", nullable: false),
                    LongBreakDuration = table.Column<int>(type: "int", nullable: false),
                    CustomWorkDuration = table.Column<int>(type: "int", nullable: false),
                    CustomBreakDuration = table.Column<int>(type: "int", nullable: false),
                    ActiveMode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TimerSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TimerSettings_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TimerStates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    RemainingTime = table.Column<int>(type: "int", nullable: false),
                    IsPlaying = table.Column<bool>(type: "bit", nullable: false),
                    Mode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TimerStates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TimerStates_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TimerSettings_UserId",
                table: "TimerSettings",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_TimerStates_UserId",
                table: "TimerStates",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TimerSettings");

            migrationBuilder.DropTable(
                name: "TimerStates");

            migrationBuilder.CreateTable(
                name: "PomodoroSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CompletedDuration = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Duration = table.Column<int>(type: "int", nullable: false),
                    EndTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SessionType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PomodoroSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PomodoroSessions_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PomodoroSessions_UserId",
                table: "PomodoroSessions",
                column: "UserId");
        }
    }
}
