using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace web.Models
{
    public class OpenchainSignature
    {
        [Required]
        public String pub_key { get; set; }

        [Required]
        public String signature { get; set; }
    }

    public class OpenchainTransaction
    {
        [Required]
        public String mutation { get; set; }

        [Required]
        public OpenchainSignature[] signatures { get; set; }
    }
}
