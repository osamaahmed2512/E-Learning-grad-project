using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GraduationProject.Migrations
{
    /// <inheritdoc />
    public partial class updatefocussession : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_focusSessions_UserId",
                table: "focusSessions");

            migrationBuilder.CreateIndex(
                name: "IX_focusSessions_UserId_Date",
                table: "focusSessions",
                columns: new[] { "UserId", "Date" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_focusSessions_UserId_Date",
                table: "focusSessions");

            migrationBuilder.CreateIndex(
                name: "IX_focusSessions_UserId",
                table: "focusSessions",
                column: "UserId");
        }
    }
}
