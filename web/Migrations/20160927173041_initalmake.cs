using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace web.Migrations
{
    public partial class initalmake : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Communities",
                columns: table => new
                {
                    handle = table.Column<string>(maxLength: 25, nullable: false),
                    OCUrl = table.Column<string>(maxLength: 128, nullable: false),
                    avatar = table.Column<string>(maxLength: 512, nullable: true),
                    description = table.Column<string>(maxLength: 1024, nullable: false),
                    full_name = table.Column<string>(maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Communities", x => x.handle);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    communityHandle = table.Column<string>(maxLength: 25, nullable: false),
                    handle = table.Column<string>(maxLength: 150, nullable: false),
                    ResetPin = table.Column<string>(maxLength: 50, nullable: true),
                    address = table.Column<string>(maxLength: 1024, nullable: false),
                    avatar = table.Column<string>(maxLength: 512, nullable: true),
                    email = table.Column<string>(maxLength: 124, nullable: false),
                    name = table.Column<string>(maxLength: 255, nullable: false),
                    phone = table.Column<string>(maxLength: 15, nullable: true),
                    pubKey = table.Column<string>(maxLength: 15, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => new { x.communityHandle, x.handle });
                    table.UniqueConstraint("AK_Users_communityHandle_email", x => new { x.communityHandle, x.email });
                    table.ForeignKey(
                        name: "FK_Users_Communities_communityHandle",
                        column: x => x.communityHandle,
                        principalTable: "Communities",
                        principalColumn: "handle",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_communityHandle",
                table: "Users",
                column: "communityHandle");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Communities");
        }
    }
}
