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
            var user = _dbContext.Users.Include(u => u.community).
                SingleOrDefault(u => u.communityHandle == Community && u.email == email);
            if (null == user)
                throw new Converters.DisplayableException("email address not found");

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
                    //foreach (Claim c in currentUser.Claims) if (c.Type == "EntityID") entityId = Convert.ToInt32(c.Value);
                    var communityClaim = currentUser.Claims.Single(c => c.Type == "Community");
                    

                    tokenExpires = DateTime.UtcNow.AddMinutes(2);
                    token = GetToken(currentUser.Identity.Name, communityClaim.Value, tokenExpires);
                }
            }
            return new { authenticated = authenticated, user = user, entityId = entityId, token = token, tokenExpires = tokenExpires };
        }

        public class AuthRequest
        {
            public string email { get; set; }
            public string pin { get; set; }
            public string PubKey { get; set; }
        }

        /// <summary>
        /// Request a new token for a given username/password pair.
        /// </summary>
        /// <param name="req"></param>
        /// <returns></returns>
        [HttpPost("reset/{Community}")]
        [AllowAnonymous]
        public async Task<dynamic> Post(String Community,[FromBody] AuthRequest req)
        {
            var user = _dbContext.Users.
                            Single(u => u.communityHandle == Community && u.email == req.email);
            if(user.ResetPin != req.pin)
                throw new Converters.DisplayableException("email or pin are incorrect");
            user.ResetPin = null;
            await _dbContext.SaveChangesAsync();

            var ocs = new OpenChainServer(user.community.OCUrl);
            using (var ad = ocs.Login(TokenController.OCAdminpassPhrase))
            {
                await CommunityController.setACL(ad, $"/aka/{user.handle}/", new[] { new {
                        subjects = new [] { new {
                            addresses = new[] {req.PubKey },
                            required =1 }
                        },
                        permissions = new {account_spend="Permit",account_modify="Permit"}
                    } });
            }


            DateTime? expires = DateTime.UtcNow.AddMinutes(2);
            var token = GetToken(user.handle, Community, expires);
            return new { authenticated = true, User = user, token = token, tokenExpires = expires };

        }

        private string GetToken(string user,String Community,  DateTime? expires)
        {
            var handler = new JwtSecurityTokenHandler();

            // Here, you should create or look up an identity for the user which is being authenticated.
            // For now, just creating a simple generic identity.
            ClaimsIdentity identity = new ClaimsIdentity(new GenericIdentity(user, "TokenAuth"), 
                new[] { new Claim("Community", Community) });

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