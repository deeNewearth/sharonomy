using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace web.Converters
{
    public class mediaConverter : JsonConverter
    {
        public override bool CanConvert(Type objectType)
        {
            return typeof(String) == objectType;
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            var data = reader.Value as String;
            if (String.IsNullOrWhiteSpace(data))
                return null;

            //return "got media";
            return null;
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }

        public override bool CanWrite { get { return false; } }
    }
}
