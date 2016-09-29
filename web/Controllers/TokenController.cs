using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Principal;
using Microsoft.IdentityModel.Tokens;
using System.Linq;
using OpenChain.Client;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;

namespace web.Controllers
{
    public class TokenAuthOptions
    {
        public string Audience { get; set; }
        public string Issuer { get; set; }
        public SigningCredentials SigningCredentials { get; set; }

        public TokenAuthOptions()
        {
        }
    }

    internal static class ClaimsExtensions
    {
        public static void EnsureCommunityAdmin(this ClaimsPrincipal User, String CommunityHandle)
        {
            if (User.Claims.Single(c => c.Type == TokenController.COMMUNITYCLAIM).Value != CommunityHandle
                || User.Claims.Single(c => c.Type == TokenController.ADMINCLAIM).Value != "true")
                throw new UnauthorizedAccessException("not a community admin");
        }
    }

    [Route("api/[controller]")]
    public class TokenController : Controller
    {
        private readonly TokenAuthOptions tokenOptions;
        private Models.CommunityContext _dbContext;

        internal const string OCAdminpassPhrase = "combat pélican gagner bateau caporal infini charbon neutron détester menhir causer espoir carbone saugrenu obscur inexact torrent rayonner laisser relief féroce honteux cirer époque";
        // corresponding address is "XiqvPB63hh8TML2iWYGDvF7i3HXRxqv3nN" : add this address to admin list in openchain server config.json


        public TokenController(TokenAuthOptions tokenOptions, Models.CommunityContext dbContext)
        {
            this.tokenOptions = tokenOptions;
            _dbContext = dbContext;
        }

        [HttpGet("reset/{Community}/{email}")]
        public async Task<dynamic> Reset(String Community, String email)
        {
            if (Community == CommunityController.UNKNOWN_COMMUNITY)
            {
                //ensure unknowns community exists
                var unknown = _dbContext.Communities.SingleOrDefault(c => c.handle == Community);
                if (null == unknown)
                {
                    unknown = new Models.Community
                    {
                        full_name = "not used unknown community",
                        description = "used to initial signin for community creaters",
                        handle = Community,
                        OCUrl = "notusednodb"
                    };
                    _dbContext.Communities.Add(unknown);
                    await _dbContext.SaveChangesAsync();
                }
            }

            var user = _dbContext.Users.Include(u => u.community).
                SingleOrDefault(u => u.communityHandle == Community && u.email == email);
            if (null == user)
            {
                if (Community == CommunityController.UNKNOWN_COMMUNITY)
                {
                    user = new Models.User
                    {
                        address = "unknown address",
                        communityHandle = CommunityController.UNKNOWN_COMMUNITY,
                        email = email,
                        name = "Community admin",
                        handle = $"admincreater_{email}"
                    };
                    _dbContext.Users.Add(user);
                }
                else
                {
                    //check if this is an admin
                    user = _dbContext.Users.SingleOrDefault(u =>
                            u.communityHandle == CommunityController.UNKNOWN_COMMUNITY
                            && u.address == $"{Community}_admin"
                            && u.handle == $"admincreater_{email}");

                    if (null == user)
                    {
                        throw new Converters.DisplayableException("email address not found");
                    }

                    
                }
            }

            var random = new Random();
            string resetPin = string.Empty;
            for (int i = 0; i < 9; i++)
                resetPin = String.Concat(resetPin, random.Next(10).ToString());

            user.ResetPin = resetPin;
            await _dbContext.SaveChangesAsync();

            using (var mailmessage = new System.Net.Mail.MailMessage(
                   new System.Net.Mail.MailAddress("noreply@shareonomy.com"),
                   new System.Net.Mail.MailAddress(email))
            {
                Subject = "Your sharenomy reset code",
                Body = $"Your Sharenomy reset code is <strong>{resetPin}</strong>.<br/>If you did not request this code please ignore this message",
                IsBodyHtml = true,
            })
            using (var mailclient = new System.Net.Mail.SmtpClient
            {
                DeliveryMethod = System.Net.Mail.SmtpDeliveryMethod.SpecifiedPickupDirectory,
                PickupDirectoryLocation = @"C:\tmp\testMailDrop",

            })
            {
                mailclient.Send(mailmessage);
            }

            return new { success = true };
        }

        /// <summary>
        /// Check if currently authenticated. Will throw an exception of some sort which shoudl be caught by a general
        /// exception handler and returned to the user as a 401, if not authenticated. Will return a fresh token if
        /// the user is authenticated, which will reset the expiry.
        /// </summary>
        /// <returns></returns>
       // [Authorize(Policy = "DisneyUser")]
        [Authorize]
        [HttpGet]
        public dynamic Get()
        {
            /* 
            ******* WARNING WARNING WARNING ****** 
            ******* WARNING WARNING WARNING ****** 
            ******* WARNING WARNING WARNING ****** 
            THIS METHOD SHOULD BE REMOVED IN PRODUCTION USE-CASES - IT ALLOWS A USER WITH 
            A VALID TOKEN TO REMAIN LOGGED IN FOREVER, WITH NO WAY OF EVER EXPIRING THEIR
            RIGHT TO USE THE APPLICATION.
            Refresh Tokens (see https://auth0.com/docs/refresh-token) should be used to 
            retrieve new tokens. 
            ******* WARNING WARNING WARNING ****** 
            ******* WARNING WARNING WARNING ****** 
            ******* WARNING WARNING WARNING ****** 
            */
            bool authenticated = false;
            string user = null;
            int entityId = -1;
            string token = null;
            DateTime? tokenExpires = default(DateTime?);

            var currentUser = HttpContext.User;
            if (currentUser != null)
            {
                authenticated = currentUser.Identity.IsAuthenticated;
                if (authenticated)
                {
                    user = currentUser.Identity.Name;
                    
                    var communityClaim = currentUser.Claims;
                    

                    tokenExpires = DateTime.UtcNow.AddMinutes(2);
                    token = GetToken(currentUser.Identity.Name, tokenExpires, 
                        currentUser.Claims.ToDictionary(k=>k.Type, v=>v.Value));
                }
            }
            return new { authenticated = authenticated, user = user, entityId = entityId, token = token, tokenExpires = tokenExpires };
        }


        [HttpGet("myHandles/{Community}/{PubKey}")]
        [AllowAnonymous]
        public async Task<Dictionary<String, String>> myHandles(String Community, String PubKey)
        {
            var toRet = new Dictionary<String, String>();

            var user = await _dbContext.Users.SingleOrDefaultAsync(
                u => u.communityHandle == Community
                && u.pubKey == PubKey
                );

            if (null != user)
                toRet["Handle"] = CommunityController.getUserPath(user.handle);

            var communityObj = await _dbContext.Communities.SingleAsync(c => c.handle == Community);



            var ocs = new OpenChainServer(communityObj.OCUrl);
            using (var ad = ocs.Login(TokenController.OCAdminpassPhrase))
            {
                //check for admin
                var treasuryACL = await getACL(ad, CommunityController.getTreasuryPath(Community),
                    new[] { new {
                        subjects = new [] { new {
                            addresses = new String[] { },
                            required =1 }
                        }
                        }}
                 );

                var adminAddress = treasuryACL.SelectMany(t =>
                        t.subjects.SelectMany(s => s.addresses.Select(a => a)));

                if (adminAddress.Contains(PubKey))
                {
                    toRet["treasuryHandle"] = CommunityController.getTreasuryPath(Community);
                }
            }



            return toRet;
        }

        public class AuthRequest
        {
            public string PubKey { get; set; }
            public Models.OpenchainTransaction treasuryHandle_transaction { get; set; }
            public Models.OpenchainTransaction Handle_transaction { get; set; }
        }

        /// <summary>
        /// Logs in against signed Transaction
        /// </summary>
        /// <param name="req"></param>
        /// <returns></returns>
        [HttpPost("{Community}")]
        [AllowAnonymous]
        public async Task<dynamic> Post(String Community, [FromBody] AuthRequest req)
        {
            var user = await _dbContext.Users.SingleOrDefaultAsync(
                u => u.communityHandle == Community
                && u.pubKey == req.PubKey
                );

            var communityObj = await _dbContext.Communities.SingleAsync(c => c.handle == Community);

            var Claims = new Dictionary<string, string> ();

            if (null != user)
            {
                if (null == req.Handle_transaction)
                    throw new Converters.DisplayableException("Handle transaction needed");

                await TransactionVerifier(CommunityController.getUserPath(user.handle),
                            req.Handle_transaction, communityObj.OCUrl);

                Claims[ACCLAIM] = "true";
            }

            if (null != req.treasuryHandle_transaction)
            {
                var ocs = new OpenChainServer(communityObj.OCUrl);
                using (var ad = ocs.Login(TokenController.OCAdminpassPhrase))
                {
                    //check for admin
                    var treasuryACL = await getACL(ad, CommunityController.getTreasuryPath(Community),
                        new[] { new {
                        subjects = new [] { new {
                            addresses = new String[] { },
                            required =1 }
                        }
                        }}
                     );

                    var adminAddress = treasuryACL.SelectMany(t =>
                            t.subjects.SelectMany(s => s.addresses.Select(a => a)));

                    if (adminAddress.Contains(req.PubKey))
                    {
                        await TransactionVerifier(CommunityController.getTreasuryPath(Community),
                            req.treasuryHandle_transaction, communityObj.OCUrl);
                        //we have admin
                        Claims[ADMINCLAIM] = "true";

                        if (null == user)
                        {
                            user = _dbContext.Users.First(u =>
                                    u.communityHandle == CommunityController.UNKNOWN_COMMUNITY
                                    && u.address == $"{Community}_admin");
                        }
                    }
                }
            }

            if (Claims.Count() == 0)
            {
                throw new Converters.DisplayableException("Failed to sign in");
            }

            Claims[COMMUNITYCLAIM] = Community;
            return createToken(user, Claims);
        }

        internal const String COMMUNITYCLAIM = "Community";
        internal const String ADMINCLAIM = "admin";
        internal const String ACCLAIM = "ACC";




        internal static async Task TransactionVerifier(
            String RecordPath, Models.OpenchainTransaction transaction,String OCUrl)
        {
            var mutation = Openchain.MessageSerializer.DeserializeMutation(Openchain.ByteString.Parse(transaction.mutation));

            var decodedRecords = mutation.Records.Select(r =>
                            new OpenChain.Client.DecodedRecord<OpenChain.Client.TransactionInfo>(r));

            var matched = decodedRecords.First(d => d.Path == RecordPath);
            /*will throw is the user recors is not in there*/


            using (var cli = new HttpClient())
            {
                var j = Newtonsoft.Json.Linq.JObject.FromObject(transaction); cli.Timeout = TimeSpan.FromHours(1);
                var query = $"{OCUrl}submit";

                var tresult = await cli.PostAsync(query,
                        new ByteArrayContent(Encoding.UTF8.GetBytes(j.ToString(Newtonsoft.Json.Formatting.None))));

                var s = await tresult.Content.ReadAsStringAsync();
                var obj = Newtonsoft.Json.Linq.JObject.Parse(s);
                if (tresult.StatusCode != System.Net.HttpStatusCode.OK)
                {
                    throw new Converters.DisplayableException("chain error : " + (string)obj["error_code"]);
                }

                var ocTransaction = new
                {
                    MutationHash = Openchain.ByteString.Parse((string)obj["mutation_hash"]),
                    TransactionHash = Openchain.ByteString.Parse((string)obj["transaction_hash"])
                };

            }

        }

        static async Task<T> getACL<T>(OpenChainSession ad, String assetPath, T format) where T : class
        {
            var assetACL = await ad.GetData<T>(assetPath, "acl");
            return assetACL.Value; 
        }

        public class AuthResetRequest
        {
            public string email { get; set; }
            public string pin { get; set; }
            public string PubKey { get; set; }
        }

        /// <summary>
        /// Resets public key against a reset pin.
        /// </summary>
        /// <param name="req"></param>
        /// <returns></returns>
        [HttpPost("reset/{Community}")]
        [AllowAnonymous]
        public async Task<dynamic> Post(String Community,[FromBody] AuthResetRequest req)
        {
            var user = await _dbContext.Users.
                            SingleOrDefaultAsync(u => u.communityHandle == Community && u.email == req.email);

            var Claims = new Dictionary<string, string>{ {"Community",Community } };

            var CommunityObj = await _dbContext.Communities.SingleAsync(c => c.handle == Community);

            if (null == user)
            {
                //check if admin
                user = await _dbContext.Users.SingleOrDefaultAsync(u =>
                        u.communityHandle == CommunityController.UNKNOWN_COMMUNITY
                        && u.email == req.email
                        && u.address == $"{Community}_admin");

                if (null == user)
                    throw new Converters.DisplayableException("invalid email or pin");
                else
                {
                    //we have admin
                    Claims[ADMINCLAIM] = "true";
                }
            } else
            {
                if(user.communityHandle == CommunityController.UNKNOWN_COMMUNITY
                    && Community == CommunityController.UNKNOWN_COMMUNITY)
                {
                    Claims[ADMINCLAIM] = "true";
                }else
                {
                    Claims[ACCLAIM] = "true";
                    user.pubKey = req.PubKey;
                }

                
            }

            if(user.ResetPin != req.pin)
                throw new Converters.DisplayableException("email or pin are incorrect");
            user.ResetPin = null;
            await _dbContext.SaveChangesAsync();

            var ocs = new OpenChainServer(CommunityObj.OCUrl);
            using (var ad = ocs.Login(TokenController.OCAdminpassPhrase))
            {
                if (Claims.ContainsKey(ADMINCLAIM) && CommunityController.UNKNOWN_COMMUNITY != Community)
                {
                    await CommunityController.SetAdminACL(ad, Community, req.PubKey);
                }

                if (Claims.ContainsKey(ACCLAIM))
                {
                    await CommunityController.setACL(ad, CommunityController.getUserPath(user.handle), new[] { new {
                        subjects = new [] { new {
                            addresses = new[] {req.PubKey },
                            required =1 }
                        },
                        permissions = new {account_spend="Permit",account_modify="Permit"}
                    } });
                }

            }

            return createToken(user, Claims);

        }

        dynamic createToken(Models.User user, Dictionary<String,String> claims)
        {
            DateTime? expires = DateTime.UtcNow.AddMinutes(2);
            var token = GetToken(user.handle, expires, claims);

            return new {token = token, tokenExpires = expires};
        }

        private string GetToken(string user, DateTime? expires,Dictionary<String,String> claims)
        {
            var handler = new JwtSecurityTokenHandler();

            // Here, you should create or look up an identity for the user which is being authenticated.
            // For now, just creating a simple generic identity.
            ClaimsIdentity identity = new ClaimsIdentity(new GenericIdentity(user, "TokenAuth"), 
                claims.Select(kv=> new Claim(kv.Key, kv.Value)).ToArray());

            var securityToken = handler.CreateToken(
                new SecurityTokenDescriptor
                {
                    Issuer= tokenOptions.Issuer,
                    Audience= tokenOptions.Audience,
                    SigningCredentials= tokenOptions.SigningCredentials,
                    Subject= identity,
                    Expires= expires
                });
            return handler.WriteToken(securityToken);
        }
    }
}