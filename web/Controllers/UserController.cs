﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Text;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace web.Controllers
{
    [Route("api/[controller]")]
    public class UserController : Controller
    {
        private Models.CommunityContext _dbContext;
        public UserController(Models.CommunityContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("{Community}/{pattern}")]
        public Models.User[] Get(String Community,String pattern)
        {
            var ret = _dbContext.Users
                .Where(u => u.communityHandle == Community &&
                    (u.handle.Contains(pattern) || u.name.Contains(pattern)
                    || u.email.Contains(pattern) || u.phone.Contains(pattern))
                ).Distinct().Take(10).ToArray();

            return ret;
        }

        [HttpPost("{handle}")]
        public String Post(String Handle,[FromBody]string value)
        {
            return "value";
        }

        /// <summary>
        /// creates a new User, will throw exception is User handle or email exists
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        [HttpPost]
        [Converters.UniqueViolation("PK_Users","handle","This user handle is already taken")]
        [Converters.UniqueViolation("AK_Users_communityHandle_email", "email", "This email address already exists")]
        public async Task<Models.User> Post([FromBody]Models.updateUserRequest req)
        {


            using (var transaction = _dbContext.Database.BeginTransaction())
            {
                _dbContext.Users.Add(req.user);
                await _dbContext.SaveChangesAsync();

                var community = _dbContext.Communities.Single(c => c.handle == req.user.communityHandle);

                await TokenController.TransactionVerifier($"/aka/{req.user.handle}/", req.transaction, $"{community.OCUrl}");

                transaction.Commit();
            }

            
            return req.user;
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
