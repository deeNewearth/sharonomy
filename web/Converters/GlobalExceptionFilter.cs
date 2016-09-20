using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace web.Converters
{
    [System.AttributeUsage(System.AttributeTargets.Method,AllowMultiple =true)]
    public class UniqueViolationAttribute : System.Attribute
    {
        public readonly String Key;
        public readonly String Field;
        public readonly String Message;
        public UniqueViolationAttribute(String key, String field, String message)
        {
            Key = key;
            Message = message;
            Field = field;
        }
    }

    class ErrorResponse
    {
        public String message { get; set; }
        public Dictionary<String, String> errors { get; set; }
    }

    public class GlobalExceptionFilter : IExceptionFilter, IDisposable
    {
        public void OnException(ExceptionContext context)
        {
            int statusCode = 500;
            var response = new ErrorResponse
            {
                message = "Failed to process",
                errors = new Dictionary<string, string>()
            };

            var action = context.ActionDescriptor as Microsoft.AspNetCore.Mvc.Controllers.ControllerActionDescriptor;
            if (null != action)
            {
                var uniques = action.MethodInfo.GetCustomAttributes(typeof(UniqueViolationAttribute), true)
                                .Cast<UniqueViolationAttribute>();

                if (context.Exception is DbUpdateException
                    && context.Exception.InnerException is SqlException
                    && context.Exception.InnerException.Message.Contains("KEY constraint")
                    )
                {
                    response.message = "Duplicate entry";

                    foreach (var u in uniques)
                    {
                        if (context.Exception.InnerException.Message.Contains(u.Key))
                        {
                            response.errors.Add(u.Field, u.Message);
                            break;
                        }

                    }
                    
                }
            }

            context.Result = new ObjectResult(response)
            {
                StatusCode = statusCode,
                DeclaredType = typeof(ErrorResponse)
            };
        }

        #region IDisposable Support
        private bool disposedValue = false; // To detect redundant calls

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    // TODO: dispose managed state (managed objects).
                }

                disposedValue = true;
            }
        }

        public void Dispose()
        {
            // Do not change this code. Put cleanup code in Dispose(bool disposing) above.
            Dispose(true);
        }
        #endregion
    }
}
