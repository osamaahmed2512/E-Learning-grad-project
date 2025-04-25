using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GraduationProject.Migrations
{
    /// <inheritdoc />
    public partial class contactus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ContactUs_User_userId",
                table: "ContactUs");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ContactUs",
                table: "ContactUs");

            migrationBuilder.RenameTable(
                name: "ContactUs",
                newName: "Contactus");

            migrationBuilder.RenameColumn(
                name: "userId",
                table: "Contactus",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "emailforcontact",
                table: "Contactus",
                newName: "Message");

            migrationBuilder.RenameIndex(
                name: "IX_ContactUs_userId",
                table: "Contactus",
                newName: "IX_Contactus_UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Contactus",
                table: "Contactus",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Contactus_User_UserId",
                table: "Contactus",
                column: "UserId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contactus_User_UserId",
                table: "Contactus");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Contactus",
                table: "Contactus");

            migrationBuilder.RenameTable(
                name: "Contactus",
                newName: "ContactUs");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "ContactUs",
                newName: "userId");

            migrationBuilder.RenameColumn(
                name: "Message",
                table: "ContactUs",
                newName: "emailforcontact");

            migrationBuilder.RenameIndex(
                name: "IX_Contactus_UserId",
                table: "ContactUs",
                newName: "IX_ContactUs_userId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ContactUs",
                table: "ContactUs",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ContactUs_User_userId",
                table: "ContactUs",
                column: "userId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
