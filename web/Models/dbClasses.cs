using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace web.Models
{
    public class CommunityContext : DbContext
    {
        public CommunityContext(DbContextOptions<CommunityContext> options)
            : base(options)
        {
            //Debug.Write(Database.Connection.ConnectionString);
            
        }

        public DbSet<User> Users { get; set; }

        /*
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {

            optionsBuilder.UseSqlServer(@"Server = (localdb)\\mssqllocaldb; Database = EFGetStarted.ConsoleApp.NewDb; Trusted_Connection = True; ");

        }*/

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasKey(c => new { c.communityHandle, c.handle });

            modelBuilder.Entity<User>()
                .HasAlternateKey(c => new { c.communityHandle, c.email });

            modelBuilder.Entity<User>()
                .HasAlternateKey(c => new { c.communityHandle, c.phoneNumber });
        }

    }

    public class User
    {
        
        [StringLength(25)]
        public string communityHandle { get; set; }

        [StringLength(25)]
        public string handle { get; set; }

        public string email { get; set; }
        public string phoneNumber { get; set; }

        [StringLength(50)]
        [Required]
        public string firstName { get; set; }

        [StringLength(50)]
        [Required]
        public string lastName { get; set; }

        [StringLength(256)]
        public string ImageUrl { get; set; }

    }
}
