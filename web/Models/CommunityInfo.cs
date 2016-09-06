using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace web.Models
{
    public class CommunityInfo
    {
        [JsonProperty("full_name")]
        public string fullName { get; set; }

        public string description { get; set; }

        [JsonProperty("admin_addresses")]
        public string[] adminAddresses { get; set; }
    }
}
