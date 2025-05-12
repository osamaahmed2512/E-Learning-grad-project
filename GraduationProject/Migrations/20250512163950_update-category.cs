using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GraduationProject.Migrations
{
    /// <inheritdoc />
    public partial class updatecategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "category");

            migrationBuilder.AddColumn<int>(
                name: "CreatedById",
                table: "category",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_category_CreatedById",
                table: "category",
                column: "CreatedById");

            migrationBuilder.AddForeignKey(
                name: "FK_category_User_CreatedById",
                table: "category",
                column: "CreatedById",
                principalTable: "User",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_category_User_CreatedById",
                table: "category");

            migrationBuilder.DropIndex(
                name: "IX_category_CreatedById",
                table: "category");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "category");

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "category",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
