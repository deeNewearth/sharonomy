using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using OpenChain.Client;
using System.Net.Http;


// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace web.Controllers
{
    [Route("api/[controller]")]
    public class CommunityController : Controller
    {
        const String _siteCreatorURL = @"http://localhost:9085";
        const String _ocURLBase = @"http://localhost:8090/";

        const string admin = "combat pélican gagner bateau caporal infini charbon neutron détester menhir causer espoir carbone saugrenu obscur inexact torrent rayonner laisser relief féroce honteux cirer époque";
        // corresponding address is "XiqvPB63hh8TML2iWYGDvF7i3HXRxqv3nN" : add this address to admin list in openchain server config.json

        const string communityadmin = "educate mutual festival portion card pink divide same cart soon pony wasp";
        //address is XvQqwAHFK1yDYpcf88kmV8S2mWLSC3mLGA

        private Models.CommunityContext _dbContext;
        public CommunityController(Models.CommunityContext dbContext)
        {
            _dbContext = dbContext;
        }


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


        [HttpPut("{handle}")]
        [Converters.UniqueViolation("PK_Communities", "handle", "This community handle is already taken")]
        public async Task<Models.OCCommunityInfo> Put(String handle, [FromBody]Models.UpdateCommunityReq req)
        {

            using (var transaction = _dbContext.Database.BeginTransaction())
            using (var cli = new HttpClient())
            {
                var newCommunity = new Models.Community
                {
                    handle = handle,
                    OCUrl = $"{_ocURLBase}{handle}/",
                };

                _dbContext.Communities.Add(newCommunity);
                await _dbContext.SaveChangesAsync();

                var query = $"{_siteCreatorURL}?site={handle}";
                var tresult = await cli.GetAsync(query);

                if (tresult.StatusCode != System.Net.HttpStatusCode.OK)
                {
                    throw new Converters.DisplayableException("Site creation error");
                }

                var s = await tresult.Content.ReadAsStringAsync();

                var ocs = new OpenChainServer(newCommunity.OCUrl);
                using (var ad = ocs.Login(admin))
                {
                    var ir = await ocs.GetData<LedgerInfo>("/", "info");
                    ir.Value = new LedgerInfo { Name = req.full_name, TermsOfService=req.description };
                    await ad.SetData(ir);


                    //create the asset defination
                    var assetPath = $"/treasury/{handle}_hours/"; 
                    var assetName = $"/asset/{handle}_hours/";

                    var assetDef = await ad.GetData<Models.AssetDefination>(assetPath, "asdef");
                    assetDef.Value = new Models.AssetDefination { name = $"Hour exchange of {req.full_name}" };
                    await ad.SetData(assetDef);

                    //set asset ACL
                    await setACL(ad, assetPath, new[] { new {
                        subjects = new [] { new {
                            addresses = new[] {req.adminPubKey },
                            required =1 }
                        },
                        permissions = new {account_negative="Permit",account_modify="Permit"}
                    } });

                    //create the asset
                    var record = await ad.Api.GetValue(assetPath, "ACC", assetName);
                    var acc = new AccountRecord(record);
                    var mutation = ad.Api.BuildMutation(Openchain.ByteString.Empty, acc);
                    await ad.PostMutation(mutation);

                    //set user ACL
                    await setACL(ad, "/aka/", new[] {
                        new {
                            subjects = new [] { new {
                                addresses = new String[]  {req.adminPubKey },
                                required =1 }
                            },
                            permissions = new {account_create="Permit",account_modify="Permit",account_spend="Permit"}
                        },
                        new {
                            subjects = new [] { new {
                                addresses = new String[] { },
                                required =0 }
                            },
                            permissions = new {account_create="",account_modify="Permit",account_spend=""}
                        },

                    });

                }
                transaction.Commit();
            }

            return req;

        }

        static async Task setACL<T>(OpenChainSession ad, String assetPath, T acl) where T:class
        {
            var assetACL = await ad.GetData<T>(assetPath, "acl");
            assetACL.Value = acl;
            await ad.SetData(assetACL);

        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
