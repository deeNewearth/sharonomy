using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using OpenChain.Client;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace web.Controllers
{
    [Route("api/[controller]")]
    public class CommunityController : Controller
    {

        const string admin = "combat pélican gagner bateau caporal infini charbon neutron détester menhir causer espoir carbone saugrenu obscur inexact torrent rayonner laisser relief féroce honteux cirer époque";
        // corresponding address is "XiqvPB63hh8TML2iWYGDvF7i3HXRxqv3nN" : add this address to admin list in openchain server config.json

        const string communityadmin = "educate mutual festival portion card pink divide same cart soon pony wasp";
        //address is XvQqwAHFK1yDYpcf88kmV8S2mWLSC3mLGA

        // GET: api/values
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/values/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/values
        //[HttpPost("{id}")]
        [HttpPut("{id}")]
        public async Task<bool> Post(String id, [FromBody]Models.CommunityInfo info)
        {
            try
            {
                var ocs = new OpenChainServer("http://localhost:63154/");

                var communityPath = $"/community/{id}/";
                using (var ad = ocs.Login(admin))
                {
                    var re = await ad.GetData<Models.CommunityInfo>(communityPath, "info");
                    if (re.Value != null)
                        throw new Exception("Community already exists");

                    re.Value = info;
                    var t1 = await ad.SetData(re);

                    return true;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        // PUT api/values/5
        //[HttpPut("{id}")]
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
