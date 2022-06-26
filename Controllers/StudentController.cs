using Microsoft.AspNetCore.Mvc;
using SWP391Group6Project.Models.DAO;
using SWP391Group6Project.Models.DTO;
using SWP391Group6Project.Models;
using System.Security.Claims;
using System.Net.Http;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using System.IO;
using Newtonsoft.Json.Linq;
using System.Linq;
using System;

namespace SWP391Group6Project.Controllers
{
    [ApiController]
    [Route("/api/[controller]")]
    public class StudentController : Controller
    {
        //Student Info
        [HttpGet("profile")]
        public IActionResult Profile()
        {
            string studentID = GetStudentIDFromClaim();
            int termNumber = GetCurrentTermFromClaim();
            var student = StudentDAO.Instance.GetStudentInfo(studentID);
            var studentReport = ReportDAO.Instance.GetReportDetail(studentID, termNumber);
            return Json(new { Error = 0, Message = $"{student != null}", Student = student, Result = studentReport });
        }
        //
        //
        //
        [HttpPost("profile/update")]
        public IActionResult UpdateProfile([FromForm] StudentProfileModel studentModel)
        {
            var result = (flag: 2, message: "Model Invalid");
            if (ModelState.IsValid)
            {
                result = (flag: -2, message: "Please Login to continue");
                string username = GetUsernameFromClaim();
                if (!string.IsNullOrEmpty(username))
                {
                    IFormFile cv = studentModel.CV;
                    if (cv != null && !cv.ContentType.Equals("application/pdf"))
                    {
                        result = (flag: -1, message: "Please upload your CV as pdf file");
                    }
                    else
                    {
                        string CV_URL = GetCVUrl(cv, GetStudentIDFromClaim()) ?? "";
                        if ((DateTime.Now.Year - studentModel.DateOfBirth.Year) >= 18)
                        {
                            var studentDTO = new StudentDTO()
                            {
                                Username = username,
                                FullName = studentModel.FullName,
                                DateOfBirth = studentModel.DateOfBirth.Date,
                                Address = studentModel.Address,
                                Phone = studentModel.Phone,
                                CV_URL = CV_URL
                            };
                            result = StudentDAO.Instance.UpdateStudentProfile(studentDTO);
                        }
                        else
                        {
                            result = (flag: -6, message: "Student age must be or older than 18");
                        }
                    }
                }
            }
            return Json(new { Error = result.flag, Message = result.message });
        }
        [HttpGet("profile/cv")]
        public IActionResult DownloadCV()
        {
            string studentID = GetStudentIDFromClaim();
            if (!string.IsNullOrEmpty(studentID))
            {
                var student = StudentDAO.Instance.GetStudentInfo(studentID);
                byte[] fileToBytes = DownloadCVFile(student.CV_URL);
                if (fileToBytes != null)
                {
                    return File(fileToBytes, "application/pdf", $"cv-{studentID}.pdf");
                }
            }
            return NoContent();
        }
        //
        //View Company list
        //
        [HttpGet("companies/{page:int}/{field:int?}")]
        public IActionResult Search([FromQuery] string search, int page, int field)
        {
            var (list, maxPage) = CompanyDAO.Instance.GetCompanyList(search, field, page);
            var term = TermDAO.Instance.GetTermInfo(GetCurrentTermFromClaim());

            var report = ReportDAO.Instance.GetReportDetail(GetStudentIDFromClaim(), GetCurrentTermFromClaim());
            return Json(new { Error = 0, Message = "there are some comapny available", MaxPage = maxPage, CompanyList = list, Term = term, report = report });
        }
        //
        //
        //
        [HttpGet("company/{companyID:int}")]
        public IActionResult CompanyDetail(int companyID)
        {
            string studentID = User.FindFirstValue("StudentID");
            int term = int.Parse(User.FindFirstValue("TermNumber"));
            var company = CompanyDAO.Instance.GetCompanyDetail(companyID);
            return Json(new { Error = 0, Message = company != null, Company = company, report = ReportDAO.Instance.GetReportDetail(studentID, term) });
        }
        //Get applied request history
        [HttpGet("recruitment/history/{page:int}")]
        public IActionResult RecruitmentHistory(int page)
        {
            string studentID = GetStudentIDFromClaim();
            int termNumber = GetCurrentTermFromClaim();
            var (list, maxPage) = RecruitmentDAO.Instance.GetRecruitmentHistory(studentID, termNumber, page);
            return Json(new { Error = 0, Message = list.Count, RequestList = list, MaxPage = maxPage });
        }

        //Create request for CRE
        [HttpPost("requests/create")]
        public IActionResult CreateRequest([FromForm] StudentRequestToCREModel model)
        {
            var result = (flag: 2, message: "Model Invalid");
            if (ModelState.IsValid)
            {
                model.StudentID = GetStudentIDFromClaim();
                result = RequestDAO.Instance.CreateRequest(model);
            }
            return Json(new { Error = result.flag, Message = result.message });
        }
        //
        //View Request sent to CRE
        //
        [HttpGet("requests/{page:int}")]
        public IActionResult CRERequestHistory(int page)
        {
            page = page < 1 ? 1 : page;
            var list = RequestDAO.Instance.GetOwnRequestList(GetStudentIDFromClaim())
                .OrderBy(r => r.RequestStatus)
                .ThenByDescending(r => r.RequestID)
                .ThenByDescending(r => r.ChangeDate);
            int count = 10;
            int maxPage = (int)Math.Ceiling((float)list.Count() / count);
            var result = list.Skip((page - 1) * count).Take(count);
            return Json(new { Requests = result, MaxPage = maxPage, Error = 0, Message = $"There are {result.Count()} requests" });
        }
        //
        //
        //
        [HttpGet("requests/detail/{requestID:int}")]
        public IActionResult RequestDetail(int requestID)
        {
            var request = RequestDAO.Instance.GetRequestDetail(requestID);
            return Json(new { Error = 0, Message = request != null, Request = request });
        }

        private string GetStudentIDFromClaim()
        {
            var studentID = User.FindFirst("StudentID");
            return studentID == null ? "" : studentID.Value;
        }
        private int GetCurrentTermFromClaim()
        {
            var termNumber = User.FindFirst("TermNumber");
            return termNumber == null ? 0 : int.Parse(termNumber.Value);
        }
        private string GetUsernameFromClaim()
        {
            var username = User.FindFirst(ClaimTypes.NameIdentifier);
            return username == null ? "" : username.Value;
        }

        private string GetCVUrl(IFormFile cvFile, string studentID)
        {
            string url = "";
            if (cvFile != null && cvFile.Length > 0)
            {
                var driveHelper = new GoogleDriveHelper();
                url = driveHelper.UploadFIle(cvFile, studentID);
            }
            return url;
        }

        private byte[] DownloadCVFile(string fileID)
        {
            byte[] fileToBytes = null;
            if (fileID != null && fileID.Length > 0)
            {
                var driveHelper = new GoogleDriveHelper();
                fileToBytes = driveHelper.DowloadFile(fileID);
            }
            return fileToBytes;
        }
    }
}