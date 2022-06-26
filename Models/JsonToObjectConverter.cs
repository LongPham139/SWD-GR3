using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace SWP391Group6Project.Models
{
    public class JsonToObjectConverter
    {
        public static string ObjectToJsonString(object obj)
        {
            return JsonConvert.SerializeObject(obj);
        }
        public static T GetObject<T>(string jsonString)
        {
            return jsonString == null ? default : JsonConvert.DeserializeObject<T>(jsonString);
        }
    }
}
