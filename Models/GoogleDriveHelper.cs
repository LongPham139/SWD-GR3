using Google.Apis.Auth.OAuth2;
using Google.Apis.Drive.v3;
using Google.Apis.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
namespace SWP391Group6Project.Models
{
    public class GoogleDriveHelper
    {
        public static string[] Scopes = { DriveService.Scope.Drive };
        public static DriveService GetDriveService()
        {
            var credential = GoogleCredential.FromFile("googledriveservices.json")
                                             .CreateScoped(DriveService.ScopeConstants.Drive);
            var service = new DriveService(new BaseClientService.Initializer()
            {
                HttpClientInitializer = credential
            });
            return service;
        }
        public string UploadFIle(IFormFile cvFile, string studentID)
        {
            string folder = new ConfigurationBuilder().SetBasePath(Directory.GetCurrentDirectory())
                                                      .AddJsonFile("googledriveservices.json", true, true)
                                                      .Build()["folder"];
            var service = GetDriveService();
            var fileMetadata = new Google.Apis.Drive.v3.Data.File();
            fileMetadata.Name = $"cv-{studentID}";
            fileMetadata.MimeType = "application/pdf";
            fileMetadata.Parents = new List<string>
            {
                folder
            };
            FilesResource.CreateMediaUpload request;
            using (var stream = cvFile.OpenReadStream())
            {
                request = service.Files.Create(fileMetadata, stream, "application/pdf");
                request.Fields = "id";
                request.Upload();
            }
            var file = request.ResponseBody;
            return file.Id;
        }
        public byte[] DowloadFile(string fileID)
        {
            byte[] bytes = null;
            var service = GetDriveService();
            using (var stream = new MemoryStream())
            {
                service.Files.Get(fileID).Download(stream);
                bytes = stream.ToArray();
            }
            return bytes;
        }
    }
}
