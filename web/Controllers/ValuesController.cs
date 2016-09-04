using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using OpenChain.Client;

namespace web.Controllers
{
    [Route("api/[controller]")]
    public class ValuesController : Controller
    {
        // these are test-only secrets !
        const string admin = "combat pélican gagner bateau caporal infini charbon neutron détester menhir causer espoir carbone saugrenu obscur inexact torrent rayonner laisser relief féroce honteux cirer époque";
        // corresponding address is "XiqvPB63hh8TML2iWYGDvF7i3HXRxqv3nN" : add this address to admin list in openchain server config.json

        const string alice = "pélican combat gagner bateau caporal infini charbon neutron détester menhir causer espoir carbone saugrenu obscur inexact torrent rayonner laisser relief féroce honteux cirer époque";
        const string bob = "pélican gagner combat bateau caporal infini charbon neutron détester menhir causer espoir carbone saugrenu obscur inexact torrent rayonner laisser relief féroce honteux cirer époque";

        // GET api/values
        [HttpGet]
        public async Task<IEnumerable<string>> Get()
        {
            var ocs = new OpenChainServer("http://localhost:63154/");

            using (var a = ocs.Login(alice))
            using (var ad = ocs.Login(admin))
            using (var b = ocs.Login(bob))
            {
                var ir = await ocs.GetData<LedgerInfo>("/", "info");
                //if (ir.Value == null || ir.Value.Name != "My Ledger")
                {
                    ir.Value = new LedgerInfo { Name = "My Ledger" };
                    await ad.SetData(ir);
                }
            }


            return new string[] { "value1", "value2" };
        }

        // GET api/values/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/values
        [HttpPost]
        public void Post([FromBody]string value)
        {
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
