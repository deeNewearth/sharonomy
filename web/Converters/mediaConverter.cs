using Microsoft.AspNetCore.Hosting;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace web.Converters
{
    public class mediaConverter : JsonConverter
    {
        /// <summary>
        /// The physical folder where to put media files
        /// </summary>
        const String MEDIAFOLDER = @"C:\codework\sharonomy\web\wwwroot\media";

        /// <summary>
        /// Public facing media base URL
        /// </summary>
        const String MEDIABASE = "/media/";

        readonly String _mediaType;
        public mediaConverter(String mediaType)
        {
            _mediaType = mediaType;
        }

        public override bool CanConvert(Type objectType)
        {
            return typeof(String) == objectType;
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            var data = reader.Value as String;
            if (String.IsNullOrWhiteSpace(data))
                return null;

            var regex = new Regex(@"data:(?<mime>[\w/\-\.]+);(?<encoding>\w+),(?<data>.*)", RegexOptions.Compiled);

            var match = regex.Match(data);
            if (!match.Success)
                return data;

            var mime = match.Groups["mime"].Value;
            var encoding = match.Groups["encoding"].Value;
            var bytes = match.Groups["data"].Value;

            //return "got media";
            if (encoding.ToLowerInvariant() != "base64")
                throw new Converters.DisplayableException("invalid data url. Must be base 64");

            var mimeSplit = mime.Split(new[] { '/' });
            if(mimeSplit[0].ToLowerInvariant() != "image")
                throw new Converters.DisplayableException("invalid data url. Only images supported");

            var fileName = $"{_mediaType}_{Guid.NewGuid().ToString()}.{mimeSplit[1]}";
            var byteArray = System.Convert.FromBase64String(bytes);

            var OutFile = Path.Combine(MEDIAFOLDER, fileName);

            using (var bw = new BinaryWriter(new FileStream(OutFile, FileMode.Create)))
            {
                bw.Write(byteArray);
                bw.Flush();
            }

            return $"{MEDIABASE}{fileName}";
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }

        public override bool CanWrite { get { return false; } }
    }
}
