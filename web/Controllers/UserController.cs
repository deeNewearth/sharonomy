using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

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

        // GET: api/values
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        [HttpGet("{community}/{pattern}")]
        public string Get(String community, String pattern)
        {
            return "value";
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
       // [ServiceFilter(typeof(Converters.CustomOneLoggingExceptionFilter))]
        [Converters.UniqueViolation("PK_Users","handle","This user handle is already taken")]
        [Converters.UniqueViolation("AK_Users_email", "email", "This email address already exists")]
        public Models.User Post([FromBody]Models.User user)
        {
            _dbContext.Users.Add(user);
            _dbContext.SaveChanges();
            return user;
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
