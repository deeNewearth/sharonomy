using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace web.Models
{
    /// <summary>
    /// the OC user info record
    /// </summary>
    public class OCUserInfo
    {
        [Required]
        [StringLength(124)]
        public string email { get; set; }
    }

    /// <summary>
    /// User record in lookup database
    /// </summary>
    public class User :OCUserInfo
    {
        [StringLength(25)]
        [Required]
        public string communityHandle { get; set; }

        [StringLength(25)]
        [Required]
        public string handle { get; set; }

        [StringLength(15)]
        public string phone { get; set; }

        [StringLength(255)]
        [Required]
        public string name { get; set; }

        [StringLength(1024)]
        [Required]
        public string address { get; set; }

        [StringLength(512)]
        [JsonConverter(typeof(Converters.mediaConverter))]
        public string avatar { get; set; }

        internal static void OnModelBuilding(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                    .HasKey(c => new { c.communityHandle, c.handle });

            modelBuilder.Entity<User>()
                .HasAlternateKey(c => new { c.communityHandle, c.email });

        }

    }

    public class updateUserRequest
    {
        [Required]
        public User user { get; set; }

        [Required]
        public OpenchainTransaction transaction { get; set; }
    }
}
