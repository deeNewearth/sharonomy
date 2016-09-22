using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using web.Models;

namespace web.Migrations
{
    [DbContext(typeof(CommunityContext))]
    partial class CommunityContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
            modelBuilder
                .HasAnnotation("ProductVersion", "1.0.0-rtm-21431")
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("web.Models.Community", b =>
                {
                    b.Property<string>("handle")
                        .HasAnnotation("MaxLength", 25);

                    b.Property<string>("OCUrl")
                        .IsRequired()
                        .HasAnnotation("MaxLength", 128);

                    b.Property<string>("avatar")
                        .HasAnnotation("MaxLength", 512);

                    b.Property<string>("description")
                        .IsRequired()
                        .HasAnnotation("MaxLength", 1024);

                    b.Property<string>("full_name")
                        .IsRequired()
                        .HasAnnotation("MaxLength", 255);

                    b.HasKey("handle");

                    b.ToTable("Communities");
                });

            modelBuilder.Entity("web.Models.User", b =>
                {
                    b.Property<string>("communityHandle")
                        .HasAnnotation("MaxLength", 25);

                    b.Property<string>("handle")
                        .HasAnnotation("MaxLength", 25);

                    b.Property<string>("address")
                        .IsRequired()
                        .HasAnnotation("MaxLength", 1024);

                    b.Property<string>("avatar")
                        .HasAnnotation("MaxLength", 512);

                    b.Property<string>("email")
                        .IsRequired()
                        .HasAnnotation("MaxLength", 124);

                    b.Property<string>("name")
                        .IsRequired()
                        .HasAnnotation("MaxLength", 255);

                    b.Property<string>("phone")
                        .HasAnnotation("MaxLength", 15);

                    b.HasKey("communityHandle", "handle");

                    b.HasAlternateKey("communityHandle", "email");

                    b.HasIndex("communityHandle");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("web.Models.User", b =>
                {
                    b.HasOne("web.Models.Community", "community")
                        .WithMany()
                        .HasForeignKey("communityHandle")
                        .OnDelete(DeleteBehavior.Cascade);
                });
        }
    }
}
