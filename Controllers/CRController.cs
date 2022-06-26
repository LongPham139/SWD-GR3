using Microsoft.AspNetCore.Mvc;
using SWP391Group6Project.Models.DAO;
using SWP391Group6Project.Models.DTO;
using SWP391Group6Project.Models;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using System.Net.Http;
using System.IO;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using System;
using System.Text;
using Microsoft.Extensions.Configuration;
using SWP391Group6Project.BackgroundServices;

namespace SWP391Group6Project.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CRController : Controller
    {
        public CRController() { }

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
        [HttpGet("student/cv/{studentID}")]
        public IActionResult DownloadCV(string studentID)
        {
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
        [HttpGet("markcsv")]
        public IActionResult GetCSV()
        {
            int term = GetCurrentTermFromClaim(), id = GetCompanyIDFromClaim();
            List<ReportDTO> reports = ReportDAO.Instance.GetCompanyCurrentTermReportList(term, id);
            StringBuilder resString = new StringBuilder("StudentID,Attendence,Attitude,Progress\r\n");
            foreach (ReportDTO item in reports)
            {
                resString.Append($"{item.StudentID},{item.Attendance},{item.Attitude},{item.Grade}\r\n");
            }
            return File(Encoding.UTF8.GetBytes(resString.ToString()), "text/csv", "markup.csv");
        }
        [HttpGet("company")]
        public IActionResult CompanyProfile()
        {
            int companyID = GetCompanyIDFromClaim();
            var company = CompanyDAO.Instance.GetCompanyDetail(companyID);
            var fields = FieldDAO.Instance.GetFields();
            return Json(new { Company = company, Error = 0, Message = "none", fields = fields });
        }
        [HttpPost("company/update")]
        public async Task<IActionResult> CompanyProfile([FromForm] CompanyInputModel model)
        {
            var result = (flag: 2, message: "Model Invalid");
            if (ModelState.IsValid)
            {
                result = (flag: -2, message: "Need CR permission");
                int companyID = GetCompanyIDFromClaim();
                if (companyID > 0)
                {
                    string imageURL = await GetImageURL(model.Image, companyID);
                    var company = new CompanyDTO()
                    {
                        CompanyID = companyID,
                        CompanyName = model.CompanyName,
                        Address = model.Address,
                        Phone = model.Phone,
                        Email = model.Email,
                        WebSite = model.WebSite,
                        Introduction = model.Introduction,
                        Description = model.Description,
                        ApplyPosition = model.ApplyPosition,
                        ImageURL = imageURL
                    };
                    result = CompanyDAO.Instance.UpdateCompanyInfo(company);
                }
            }
            return Json(new { Error = result.flag, Message = result.message });
        }
        [HttpPost("company/field")] 
        public IActionResult ChangeField([FromBody]FieldDTO[] model)
        {
            var result = (flag: 2, message: "Model Invalid");
            if (ModelState.IsValid)
            {
                int companyID = GetCompanyIDFromClaim();
                result = (flag: -2, message: "Need CR permission");
                if (companyID > 0)
                {
                    if (model != null)
                    {
                        result = CompanyDAO.Instance.UpdateCompanyFields(model, companyID);
                    }
                }
            }
            return Json(new { Error = result.flag, Message = result.message });
        }
        //
        //*********** Student Management ***********
        //
        //Student Recruited list
        //
        [HttpGet("students/{page:int}/{seach:=}")]
        public IActionResult RecruitedStudentList(int page, string seach = "")
        {
            int company = GetCompanyIDFromClaim();
            int term = GetCurrentTermFromClaim();
            var (list, maxPage) = StudentDAO.Instance.GetThisTermCompanyStudentList(seach, company, term, page);
            return Json(new { RequestList = list, MaxPage = maxPage, Error = 0, Message = $"There are {list.Count} student(s) recruited" });
        }
        //
        //Student profile
        //
        [HttpGet("students/profile/{studentID:=}")]
        public IActionResult ViewStudentProfile(string studentID)
        {
            int currentTerm = GetCurrentTermFromClaim();
            int companyID = GetCompanyIDFromClaim();
            var student = StudentDAO.Instance.GetStudentInfo(studentID);
            var report = ReportDAO.Instance.GetReportDetail(studentID, currentTerm);
            if (report != null && report.CompanyID != companyID) report = null;
            return Json(new { Error = 0, Message = $"{student != null}", Student = student, Report = report });
        }
        //********* Recruit Management *******
        //
        //View student apply list
        //
        [HttpGet("requests/{page:int}")]
        public IActionResult RequestList(int page)
        {
            int company = GetCompanyIDFromClaim();
            var (list, maxPage) = RecruitmentDAO.Instance.GetInterviewRequest(company, page);
            return Json(new { RequestList = list, MaxPage = maxPage, Error = 0, Message = $"There are {list.Count} requests" });
        }
        //
        //Process apply request
        //
        [HttpGet("requests/process/{studentID:=}/{status:int}")]
        public IActionResult ProcessRequest(string studentID, int status)
        {
            var result = (flag: -2, message: "Need CR permission");
            int companyID = GetCompanyIDFromClaim();
            if (companyID > 0)
            {
                result = (flag: -3, message: "Invalid status input");
                if (status == 1 || status == 2)
                {
                    var instance = RecruitmentDAO.Instance;
                    int termNumber = GetCurrentTermFromClaim();
                    result = instance.ProcessApplyRequest(studentID, companyID, GetCRIDFromClaim(), termNumber, status);
                    if (result.flag == 0)
                    {
                        StudentApplyResult applyResult = instance.GetStudentApplyRequest(companyID, studentID, termNumber);
                        string html = System.IO.File.ReadAllText("Student-email.html")
                        .Replace("{{name}}", applyResult.FullName)
                        .Replace("{{companyname}}", applyResult.CompanyName)
                        .Replace("{{email}}", applyResult.Email)
                        .Replace("{{textColor}}", status == 1 ? "green" : "red")
                        .Replace("{{statusName}}", applyResult.StatusName);
                        StudentDTO student = StudentDAO.Instance.GetStudentInfo(studentID);
                        EmailSender.SendHtmlEmail(student.Email, "Your apply request has been processed !", html);
                    }
                }
            }
            return Json(new { Error = result.flag, Message = result.message });
        }
        //
        //******** Report Management ******
        //
        [HttpPost("reports/evaluate")]
        public IActionResult EvaluateStudent([FromBody] StudentGradeResult[] resultList)
        {
            var result = (flag: 2, message: "Model Invalid");
            if (ModelState.IsValid)
            {
                result = (flag: -2, message: "Need CR permission");
                if (GetCompanyIDFromClaim() > 0)
                {
                    if (resultList != null)
                    {
                        foreach (var item in resultList)
                        {
                            var report = new ReportDTO()
                            {
                                StudentID = item.StudentID,
                                TermNumber = GetCurrentTermFromClaim(),
                                CompanyID = GetCompanyIDFromClaim(),
                                CR_ID = GetCRIDFromClaim(),
                                Attendance = item.Attendance,
                                Attitude = item.Attitude,
                                Grade = item.Progress
                            };
                            result = ReportDAO.Instance.UpdateReport(report);
                        }
                    }
                }
            }
            return Json(new { Error = result.flag, Message = result.message });
        }
        //
        //
        //
        [HttpGet("reports/download")]
        public IActionResult ExportReportList()
        {
            var termNumber = GetCurrentTermFromClaim();
            var companyID = GetCompanyIDFromClaim();
            var reportList = ReportDAO.Instance.GetCompanyCurrentTermReportList(termNumber, companyID);
            using (var xlWorkBook = new ClosedXML.Excel.XLWorkbook())
            {
                var reportSheet = xlWorkBook.Worksheets.Add("OJT Reports");
                var row = 1;
                reportSheet.Cell(row, 1).Value = "StudentID";
                reportSheet.Cell(row, 2).Value = "TermNumber";
                reportSheet.Cell(row, 3).Value = "TermName";
                reportSheet.Cell(row, 4).Value = "CompanyID";
                reportSheet.Cell(row, 5).Value = "CompanyName";
                reportSheet.Cell(row, 6).Value = "Attendance";
                reportSheet.Cell(row, 7).Value = "Attitude";
                reportSheet.Cell(row, 8).Value = "Progress";
                reportSheet.Cell(row, 9).Value = "Average";
                reportSheet.Cell(row, 10).Value = "Evaluate";

                foreach (var report in reportList)
                {
                    row++;
                    reportSheet.Cell(row, 1).Value = report.StudentID;
                    reportSheet.Cell(row, 2).Value = report.TermNumber;
                    reportSheet.Cell(row, 3).Value = report.TermName;
                    reportSheet.Cell(row, 4).Value = report.CompanyID;
                    reportSheet.Cell(row, 5).Value = report.CompanyName;
                    reportSheet.Cell(row, 6).Value = report.Attendance;
                    reportSheet.Cell(row, 7).Value = report.Attitude;
                    reportSheet.Cell(row, 8).Value = report.Grade;
                    reportSheet.Cell(row, 9).Value = report.Average;
                    reportSheet.Cell(row, 10).Value = report.Evaluate;
                }
                using (var stream = new System.IO.MemoryStream())
                {
                    xlWorkBook.SaveAs(stream);
                    var reportListByteArray = stream.ToArray();
                    return File(reportListByteArray, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"OJTReports-TermNum-{termNumber}-CompanyID-{companyID}.xlsx");
                }
            }
        }
        private int GetCRIDFromClaim()
        {
            var crID = User.FindFirst("CR_ID");
            return crID == null ? 0 : int.Parse(crID.Value);
        }

        private int GetCompanyIDFromClaim()
        {
            var companyID = User.FindFirst("CompanyID");
            return companyID == null ? 0 : int.Parse(companyID.Value);
        }
        private int GetCurrentTermFromClaim()
        {
            var termNumber = User.FindFirst("TermNumber");
            return termNumber == null ? 0 : int.Parse(termNumber.Value);
        }

        private async Task<string> GetImageURL(IFormFile image, int companyID)
        {
            var configBuilder = new ConfigurationBuilder().SetBasePath(Directory.GetCurrentDirectory())
                                                          .AddJsonFile("appsettings.json", true, true)
                                                          .Build();
            string imgBBKey = configBuilder["ImgBB:Key"];
            string imgUploadURL = configBuilder["ImgBB:UploadUrl"];
            string url = null;
            if (image != null && image.Length > 0)
            {
                using (var httpClient = new HttpClient())
                {
                    using (var content = new MultipartFormDataContent())
                    {
                        content.Add(new StreamContent(image.OpenReadStream()), "image", companyID + "");
                        var response = await httpClient.PostAsync(imgUploadURL + imgBBKey, content);
                        if (response.StatusCode == System.Net.HttpStatusCode.OK)
                        {
                            JObject responseJson = JObject.Parse(await response.Content.ReadAsStringAsync());
                            url = responseJson["data"]["url"].ToString();
                        }
                    }
                }
            }
            return url;
        }
    }
}
