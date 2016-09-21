using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace web.Migrations
{
    public partial class initialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    communityHandle = table.Column<string>(maxLength: 25, nullable: false),
                    handle = table.Column<string>(maxLength: 25, nullable: false),
                    address = table.Column<string>(maxLength: 1024, nullable: false),
                    avatar = table.Column<string>(maxLength: 512, nullable: true),
                    email = table.Column<string>(maxLength: 124, nullable: false),
                    name = table.Column<string>(maxLength: 255, nullable: false),
                    phone = table.Column<string>(maxLength: 15, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => new { x.communityHandle, x.handle });
                    table.UniqueConstraint("AK_Users_communityHandle_email", x => new { x.communityHandle, x.email });
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
