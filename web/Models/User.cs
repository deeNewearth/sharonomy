using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace web.Models
{
    public class User
    {
        [StringLength(25)]
        public string handle { get; set; }

        [Required]
        [StringLength(124)]
        public string email { get; set; }

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

    }
}
