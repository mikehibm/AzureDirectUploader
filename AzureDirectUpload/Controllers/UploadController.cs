using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Configuration;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Shared.Protocol;
using Microsoft.WindowsAzure.Storage.Blob;

namespace AzureDirectUpload.Controllers {

    [RoutePrefix("api/azure")]
    public class UploadController : ApiController {

        private static string _connectionString = ConfigurationManager.AppSettings["AzureStorageConnection"];
        private static string _accountName = ConfigurationManager.AppSettings["AzureStorageAccountName"];
        private static string _containerName = ConfigurationManager.AppSettings["AzureStorageContainerName"];
        private static string _allowedOrigins = ConfigurationManager.AppSettings["AzureStorageAllowedOrigins"];
        private static int _sasExpireMinutes = int.Parse(ConfigurationManager.AppSettings["AzureStorageSASExpireMinutes"]);

        private static void SetCorsRule() {
            var account = CloudStorageAccount.Parse(_connectionString);
            var client = account.CreateCloudBlobClient();

            var properties = client.GetServiceProperties();
            properties.Cors.CorsRules.Clear();
            properties.Cors.CorsRules.Add(new CorsRule() {
                AllowedHeaders = { "*" },
                AllowedMethods = CorsHttpMethods.Put,
                AllowedOrigins = { _allowedOrigins },
                ExposedHeaders = { "*" },
                MaxAgeInSeconds = 60 * (_sasExpireMinutes + 10)
            });
            client.SetServiceProperties(properties);
        }

        private static string GenerateSas(DateTime expires) {
            var account = CloudStorageAccount.Parse(_connectionString);
            var client = account.CreateCloudBlobClient();
            var container = client.GetContainerReference(_containerName);

            return container.GetSharedAccessSignature(new SharedAccessBlobPolicy {
                Permissions = SharedAccessBlobPermissions.Write,
                SharedAccessStartTime = DateTime.UtcNow.AddMinutes(-10),
                SharedAccessExpiryTime = expires,
            });
        }

        [Route("sas"), HttpPost()]
        public IHttpActionResult GetUploadURL() {
            SetCorsRule();

            var expires = DateTime.UtcNow.AddMinutes(_sasExpireMinutes);
            var sas = GenerateSas(expires);

            var url = string.Format("https://{0}.blob.core.windows.net/{1}/$filename${2}", 
                                        _accountName, _containerName, sas);

            var result = new { url = url, expires = expires };
            return Ok(result);
        }

    }
}