using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Mvc.Authorization;

namespace web
{
    public class Startup
    {
        readonly RsaSecurityKey key;
        readonly Controllers.TokenAuthOptions tokenOptions;
        const string TokenAudience = "SharonomyAudience";
        const string TokenIssuer = "SharonomyIssuer";

        public Startup(IHostingEnvironment env)
        {

            // See the RSAKeyUtils.GetKeyParameters method for an examle of loading from
            // a JSON file.
            RSAParameters keyParams = RSAKeyUtils.GetRandomKey();
            key = new RsaSecurityKey(keyParams);
            tokenOptions = new Controllers.TokenAuthOptions()
            {
                Audience = TokenAudience,
                Issuer = TokenIssuer,
                SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.RsaSha256Signature)
            };

            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true);

            if (env.IsEnvironment("Development"))
            {
                // This will push telemetry data through Application Insights pipeline faster, allowing you to view results immediately.
                builder.AddApplicationInsightsSettings(developerMode: true);
            }

            builder.AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container
        public void ConfigureServices(IServiceCollection services)
        {

            // Add framework services.
            services.AddApplicationInsightsTelemetry(Configuration);

           var builder = services.AddMvc();

            builder.AddMvcOptions(o => { o.Filters.Add(new Converters.GlobalExceptionFilter()); });

            
            services.AddSingleton<Controllers.TokenAuthOptions>(tokenOptions);


            
            services.AddAuthorization(options =>
            {

                //Default User Authorization Policy
                options.DefaultPolicy = new AuthorizationPolicyBuilder()
                .AddAuthenticationSchemes(JwtBearerDefaults.AuthenticationScheme)
                .RequireAuthenticatedUser()
                .Build();


                options.AddPolicy("DisneyUser",
                      policy => policy.RequireClaim("DisneyCharacter", "IAmMickey").RequireAuthenticatedUser());
            });
            

            var connection = @"Server = (localdb)\mssqllocaldb; Database = sharonomy; Trusted_Connection = True; ";
            services.AddDbContext<Models.CommunityContext>(options => options.UseSqlServer(connection));
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            //            app.UseApplicationInsightsRequestTelemetry();
            //            app.UseApplicationInsightsExceptionTelemetry();

           

            app.UseJwtBearerAuthentication(new JwtBearerOptions
            {
                // Basic settings - signing key to validate with, audience and issuer.
                TokenValidationParameters = new TokenValidationParameters
                {
                    // The signing key must match!
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,

                    // Validate the JWT Issuer (iss) claim
                    ValidateIssuer = true,
                    ValidIssuer = tokenOptions.Issuer,

                    // Validate the JWT Audience (aud) claim
                    ValidateAudience = true,
                    ValidAudience = tokenOptions.Audience,

                    // Validate the token expiry
                    ValidateLifetime = true,
                    RequireExpirationTime = true,

                    // If you want to allow a certain amount of clock drift, set that here:
                    ClockSkew = TimeSpan.FromMinutes(1),

                    AuthenticationType = JwtBearerDefaults.AuthenticationScheme,


                },

                


                AutomaticAuthenticate = true,
                AutomaticChallenge = true,


            });

            app.UseMvc();

            app.UseStatusCodePagesWithReExecute("/");
            app.UseDefaultFiles();

            app.UseStaticFiles();

             
        }
    }
}
