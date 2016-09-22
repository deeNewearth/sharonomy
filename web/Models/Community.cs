using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace web.Models
{
    /// <summary>
    /// Keeps track of community in the database
    /// </summary>
    public class Community : OCCommunityInfo
    {
        [Required]
        [StringLength(25)]
        public string handle { get; set; }

        /// <summary>
        /// The openchain server URL used for this community
        /// </summary>
        [Required]
        [StringLength(128)]
        public string OCUrl { get; set; }

        [StringLength(512)]
        [JsonConverter(typeof(Converters.mediaConverter))]
        public string avatar { get; set; }

        internal static void OnModelBuilding(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Community>()
                    .HasKey(c => new { c.handle });
        }
    }

    /// <summary>
    /// The information kept in the OC Ledger
    /// </summary>
    public class OCCommunityInfo
    {
        [Required]
        [StringLength(255)]
        public string full_name { get; set; }

        [Required]
        [StringLength(1024)]
        public string description { get; set; }
    }

    /// <summary>
    /// Used to update community descption
    /// </summary>
    public class UpdateCommunityReq : OCCommunityInfo
    {
        /// <summary>
        /// The publickey of the first community admin
        /// </summary>
        [Required]
        [StringLength(64)]
        public string adminPubKey { get; set; }

    }
}
