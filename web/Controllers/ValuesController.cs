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

            var hex = Openchain.ByteString.Parse(@"0a08043ab9b8083e012d128e020a1e2f636f6d6d756e6974792f66676667666766672f3a444154413a696e666f12c9010ac6017b2266756c6c5f6e616d65223a2253616e206d6172636f73206c616b6520617469746c616e2062616c2064617364207361646173646173646173647361222c226465736372697074696f6e223a2261736461736461736461736461735c6e646173646173646173646173646173645c6e617364736164736164617364617364736164617364617364736164222c2261646d696e5f616464726573736573223a5b2258765171774148464b3179445970636638386b6d563853326d574c5343336d4c4741225d7d1a20f975e06eb75f382155a47d94a3adf7edac028cdb4b2e962b80023ca66e812140");

            var m = Openchain.MessageSerializer.DeserializeMutation(hex);

            var record = m.Records.First();
            var g1 = new OpenChain.Client.DecodedRecord<Models.CommunityInfo>(record);
            var g3 = g1;

            /*
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
            */


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
