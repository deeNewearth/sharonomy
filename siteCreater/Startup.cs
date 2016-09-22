using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Web.Administration;
using System.Text;
using System.Security.Cryptography;
using Newtonsoft.Json;

namespace siteCreater
{
    public class Startup
    {
        const long OCSITEID = 3;
        const String OCSitePath = @"C:\tmp\testopen\openpublish";

        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit http://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
        }

        static string RandomString(int length)
        {
            const string valid = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
            StringBuilder res = new StringBuilder();
            using (RNGCryptoServiceProvider rng = new RNGCryptoServiceProvider())
            {
                byte[] uintBuffer = new byte[sizeof(uint)];

                while (length-- > 0)
                {
                    rng.GetBytes(uintBuffer);
                    uint num = BitConverter.ToUInt32(uintBuffer, 0);
                    res.Append(valid[(int)(num % (uint)valid.Length)]);
                }
            }

            return res.ToString();
        }

        static object getConfig(String siteName)
        {
            return new
            {
                enable_transaction_stream = true,

                storage = new
                {
                    provider = "SQLite",
                    path = $"ledger_{siteName}.db"
                },


                validator_mode = new
                {
                    instance_seed = RandomString(30),
                    validator = new
                    {
                        provider = "PermissionBased",
                        allow_p2pkh_accounts = false,
                        allow_third_party_assets = false,
                        admin_addresses = new[] {
                            "XcSedwFe2rwRFRD57SReTor4zvfa5VjRF7",
                            "XiqvPB63hh8TML2iWYGDvF7i3HXRxqv3nN"
                        },
                        version_byte = 76
                    }
                },


                anchoring = new
                {
                    provider = "Blockchain",
                    // The key used to publish anchors in the Blockchain
                    key = "",
                    bitcoin_api_url = "https://testnet.api.coinprism.com/v1/",
                    network_byte = 111,
                    fees = 5000,
                    storage = new
                    {
                        provider = "SQLite",
                        path = $"anchors_{siteName}.db"
                    }
                }
            };
        }
        

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.Run(async (context) =>
            {
                var siteName = context.Request.Query["site"];
                if (String.IsNullOrWhiteSpace(siteName))
                    throw new ArgumentNullException();

                using (var serverManager = new ServerManager())
                {
                    var rootSite = serverManager.Sites.Single(s => s.Id == OCSITEID);
                    var port = rootSite.Bindings.First().EndPoint.Port;

                    string configText = JsonConvert.SerializeObject(getConfig(siteName));
                    string configFile = $"{OCSitePath}\\data\\{siteName}_config.json";

                    System.IO.File.WriteAllText(configFile, configText);

                    var vapp = rootSite.Applications.Add($"/{siteName}", OCSitePath);
                    // set application pool, otherwise it'll run in DefaultAppPool
                    vapp.ApplicationPoolName = "testopen";
                    serverManager.CommitChanges();

                    context.Response.ContentType = "application/json";
                    
                    await context.Response.WriteAsync(JsonConvert.SerializeObject(new { port = port }));

                }

            });
        }
    }
}
