using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;

namespace web.Models
{
    public class CommunityContext : DbContext
    {
        /*
         * Add-Migration MIGARTIONAME to scaffold a migration
         * Update-Database to apply the new migration to the database.
         */


        public CommunityContext(DbContextOptions<CommunityContext> options)
            : base(options)
        {
            //Debug.Write(Database.Connection.ConnectionString);
            
        }

        
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            User.OnModelBuilding(modelBuilder);
        }

    }

    
}
