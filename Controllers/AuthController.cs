using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using SWP391Group6Project.Models.DTO;
using SWP391Group6Project.Models;
using System.Net.Http;
using Microsoft.Extensions.Configuration;
using System.IO;
using Newtonsoft.Json.Linq;
using System.Net;
using SWP391Group6Project.Models.DAO;
using Microsoft.AspNetCore.Http;
using System.Runtime.Serialization.Formatters.Binary;
using SWP391Group6Project.BackgroundServices;
using System.Text;
namespace SWP391Group6Project.Controllers
{
    [ApiController]
    [Route("/api/[controller]")]
    public class AuthController : Controller
    {
        [HttpGet("get")]
        public IActionResult Get()
        {
            int error = 1;
            string message = "You are not logged in";
            UserDTO user = null;
            if (User.Claims.Count() != 0)
            {
                error = 0;
                message = "You are logged in";
                user = new UserDTO
                {
                    Email = User.FindFirstValue(ClaimTypes.Email),
                    FullName = User.FindFirstValue(ClaimTypes.Name),
                    RoleID = Convert.ToInt32(User.FindFirstValue("RoleID")),
                    RoleName = User.FindFirstValue(ClaimTypes.Role),
                    Username = User.FindFirstValue(ClaimTypes.NameIdentifier)
                };
            }
            return Ok(new { account = user, error = error, message = message });
        }

        [HttpPost("login")]
        public IActionResult Login([FromForm] LoginModel model)
        {
            int flag = 1;
            string message = "Incorrect username or password OR Your account is not activated";
            var account = UserDAO.Instance.Login(model.Username, model.Password);
            if (account != null)
            {
                flag = 0;
                message = "Login Successfully";
                account = CreatePrincipalClaim(account).Result;
            }
            return Json(new { Account = account, Error = flag, Message = message });
        }
        [HttpGet("google/login/{accessToken}")]
        public IActionResult LoginGoogle(string accessToken)
        {
            int flag = -100;
            string message = "Your account does not have permission to log in our system";
            dynamic account = GetUserInfo(accessToken).Result;
            if (account != null)
            {
                flag = 0;
                message = "Login Successfully";
                account = CreatePrincipalClaim(account).Result;
            }
            return Json(new { Error = flag, Message = message, Account = account });
        }
        [HttpGet("verify/{code}")]
        public IActionResult Verify(string code)
        {
            var result = (flag: 2, message: "Wrong verify code");
            CRResgiterModel model = FromByteArray<CRResgiterModel>(HttpContext.Session.Get("model"));
            string vCode = HttpContext.Session.GetString("code");
            if (vCode == code)
            {
                var companyDTO = new CompanyDTO()
                {
                    CompanyName = model.CompanyName,
                    Address = model.Address,
                    Phone = model.Phone,
                    Email = model.Email,
                    WebSite = model.WebSite
                };
                var crDTO = new CRDTO()
                {
                    Username = model.Username,
                    FullName = model.CompanyName,
                    Email = model.Email
                };
                result = CRDAO.Instance.AddNewCR(companyDTO, crDTO, model.Password);
            }
            return Ok(new{ error = result.flag, message = result.message});
        }
        [HttpPost("register/company")]
        public IActionResult CompanyRegister([FromForm] CRResgiterModel model)
        {
            (int error, string message) result = CRDAO.Instance.CheckCompanyExsit(model.Username, model.Email, model.CompanyName);
            if (result.error == 0)
            {
                string code = RandomString();
                string html = System.IO.File.ReadAllText("CR-email-register.html")
                .Replace("{{username}}", model.Username)
                .Replace("{{company}}", model.CompanyName)
                .Replace("{{email}}", model.Email)
                .Replace("{{phone}}", model.Phone)
                .Replace("{{address}}", model.Address)
                .Replace("{{website}}", model.WebSite)
                .Replace("{{verify}}", code);
                EmailSender.SendHtmlEmail(model.Email, "Verify email", html);
                HttpContext.Session.SetString("code", code);
                HttpContext.Session.Set("model", ToByteArray<CRResgiterModel>(model));
            }
            return Ok(new { error = result.error, message = result.message });
        }
        [HttpPost("password/change")]
        public IActionResult ChangePassword([FromForm] ChangePasswordModel model)
        {
            var result = (flag: 2, message: "Model Invalid");
            if (ModelState.IsValid)
            {
                string username = GetUsernameFromClaim();
                result = UserDAO.Instance.ChangePassword(username, model.OldPassword, model.NewPassword);
            }
            return Json(new { Error = result.flag, Message = result.message });
        }
        [Authorize]
        [HttpGet("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync();
            return Ok(new { error = 0, message = "Logout successfully" });
        }
        [HttpGet("field")]
        public IActionResult GetFields()
        {
            var fields = FieldDAO.Instance.GetFields();
            return Json(new { Error = 0, Message = "Some fields are avalible", Fields = fields });
        }

        private async Task<dynamic> GetUserInfo(string accessToken)
        {
            dynamic user = null;

            using (var httpClient = new HttpClient())
            {
                var configBuilder = new ConfigurationBuilder().SetBasePath(Directory.GetCurrentDirectory())
                                                          .AddJsonFile("appsettings.json", true, true)
                                                          .Build();
                string getInfoUrl = configBuilder["GooglePlusAPI:GetInfoUrl"];
                var response = await httpClient.GetAsync(getInfoUrl + accessToken);
                if (response.StatusCode == HttpStatusCode.OK)
                {
                    string responseString = await response.Content.ReadAsStringAsync();
                    var jObject = JObject.Parse(responseString);
                    bool verified = jObject["verified_email"].ToObject<bool>();
                    if (verified)
                    {
                        string email = jObject["email"] == null ? "" : jObject["email"].ToString();
                        user = UserDAO.Instance.LoginGoogle(email);
                    }
                }
            }
            return user;
        }

        private async Task<dynamic> CreatePrincipalClaim(dynamic account)
        {
            var currTerm = TermDAO.Instance.GetCurrentTerm();
            ClaimsPrincipal claimsPrincipal = new ClaimsPrincipal();
            List<Claim> claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Email,account.Email),
                    new Claim(ClaimTypes.Name, account.FullName),
                    new Claim("RoleID",account.RoleID.ToString()),
                    new Claim(ClaimTypes.NameIdentifier,account.Username),
                    new Claim(ClaimTypes.Role, account.RoleName),
                    new Claim("TermNumber", currTerm.TermNumber.ToString())
                };
            switch (account.RoleID.ToString())
            {
                case "1":
                    claims.Add(new Claim(("CRE_ID"), account.CRE_ID.ToString()));
                    account = new
                    {
                        Username = account.Username,
                        FullName = account.FullName,
                        Email = account.Email,
                        RoleID = account.RoleID,
                        RoleName = account.RoleName,
                        CRE_ID = account.CRE_ID
                    };
                    break;
                case "2":
                    claims.Add(new Claim(("StudentID"), account.StudentID));
                    account = new
                    {
                        Username = account.Username,
                        FullName = account.FullName,
                        Email = account.Email,
                        RoleID = account.RoleID,
                        RoleName = account.RoleName,
                        StudentID = account.StudentID
                    };
                    break;
                case "3":
                    claims.Add(new Claim(("CR_ID"), account.CR_ID.ToString()));
                    claims.Add(new Claim(("CompanyID"), account.CompanyID.ToString()));
                    account = new
                    {
                        Username = account.Username,
                        FullName = account.FullName,
                        Email = account.Email,
                        RoleID = account.RoleID,
                        RoleName = account.RoleName,
                        CR_ID = account.CR_ID,
                        CompanyID = account.CompanyID
                    };
                    break;
            }
            ClaimsIdentity identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            claimsPrincipal.AddIdentity(identity);
            await HttpContext.SignInAsync(claimsPrincipal);
            return account;
        }

        private string GetUsernameFromClaim()
        {
            var username = User.FindFirst(ClaimTypes.NameIdentifier);
            return username == null ? "" : username.Value;
        }

        byte[] ToByteArray<T>(T obj)
        {
            if (obj == null)
                return null;
            BinaryFormatter bf = new BinaryFormatter();
            using (MemoryStream ms = new MemoryStream())
            {
                bf.Serialize(ms, obj);
                return ms.ToArray();
            }
        }
        private T FromByteArray<T>(byte[] arrBytes)
        {
            MemoryStream memStream = new MemoryStream();
            BinaryFormatter binForm = new BinaryFormatter();
            memStream.Write(arrBytes, 0, arrBytes.Length);
            memStream.Seek(0, SeekOrigin.Begin);
            T obj = (T)binForm.Deserialize(memStream);
            return obj;
        }
        private string RandomString()
        {
            int lenght = 10;
            string s = "1234567890QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm";
            StringBuilder result = new StringBuilder();
            Random random = new Random();
            for (int i = 0; i < lenght; i++)
            {
                result.Append(s[random.Next(0, s.Length - 1)]);
            }
            return result.ToString();
        }

    }
}