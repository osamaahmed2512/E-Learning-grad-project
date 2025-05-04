using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GraduationProject.Migrations
{
    /// <inheritdoc />
    public partial class FixSubscriptionRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_courses_User_Instructor_Id",
                table: "courses");

            migrationBuilder.DropForeignKey(
                name: "FK_Subscriptions_courses_CourseId",
                table: "Subscriptions");

            migrationBuilder.AddForeignKey(
                name: "FK_courses_User_Instructor_Id",
                table: "courses",
                column: "Instructor_Id",
                principalTable: "User",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Subscriptions_courses_CourseId",
                table: "Subscriptions",
                column: "CourseId",
                principalTable: "courses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_courses_User_Instructor_Id",
                table: "courses");

            migrationBuilder.DropForeignKey(
                name: "FK_Subscriptions_courses_CourseId",
                table: "Subscriptions");

            migrationBuilder.AddForeignKey(
                name: "FK_courses_User_Instructor_Id",
                table: "courses",
                column: "Instructor_Id",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Subscriptions_courses_CourseId",
                table: "Subscriptions",
                column: "CourseId",
                principalTable: "courses",
                principalColumn: "Id");
        }
    }
}
