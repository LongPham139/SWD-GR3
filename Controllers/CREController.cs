using Microsoft.AspNetCore.Mvc;
using System.Linq;
using SWP391Group6Project.Models.DAO;
using SWP391Group6Project.Models.DTO;
using SWP391Group6Project.Models;
using System;
using SWP391Group6Project.BackgroundServices;
namespace SWP391Group6Project.Controllers
{
    [ApiController]
    [Route("/api/[controller]")]
    public class CREController : Controller
    {
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
        //Create new Term
        [HttpPost("create")]
        public IActionResult Create([FromForm] TermCreateModel model)
        {
            var result = (flag: 2, message: "Model Invalid");
            if (ModelState.IsValid)
            {
                result = (flag: -2, message: "Need CRE permission");
                if (GetCREIDFromClaim() > 0)
                {
                    var start = model.StartDate.Date;
                    var end = model.EndDate.Date;
                    var due = model.RequestDueDate;
                    if (!(start.CompareTo(end) <= 0 &&
                          due.CompareTo(end) <= 0 &&
                          due.CompareTo(start) >= 0))
                    {
                        result = (flag: -96, message: "Start date must smaller than request due date and request date must smaller than end date");
                    }
                    else
                    {
                        TimeSpan fourMonth = new TimeSpan(120, 0, 0, 0);
                        if (end.Subtract(start).CompareTo(fourMonth) < 0)
                        {
                            result = (flag: -95, message: $"Start date of this semester must be after the it's end date ({end.ToString("MM/dd/yyyy")}) at least 4 months (~120 days)");
                        }
                        else
                        {
                            var instance = TermDAO.Instance;
                            var lastestAddedTerm = instance.GetLastestAddedTerm();
                            if (lastestAddedTerm == null) 
                            {
                                result = instance.CreateNewTerm(model);
                            }
                            else if (start.CompareTo(lastestAddedTerm.EndDate) > 0)
                            {
                                if (lastestAddedTerm.StartDate <= DateTime.Now)
                                {
                                    result = instance.CreateNewTerm(model);
                                }
                                else
                                {
                                    result = (flag: -94, message: $"Lasted semester are not started, can't create a new term");
                                }
                            }
                            else
                            {
                                result = (flag: -94, message: $"Start date must after lastest end date semester: {lastestAddedTerm.TermName} ({lastestAddedTerm.StartDate:MM/dd/yyyy} - {lastestAddedTerm.EndDate:MM/dd/yyyy})");
                            }
                        }
                    }
                }
            }
            return Json(new { Error = result.flag, Message = result.message });
        }
        [HttpPost("update")]
        public IActionResult Update([FromForm] TermUpdateModel model)
        {
            var result = (flag: 2, message: "Model Invalid");
            var start = model.StartDate.Date;
            var end = model.EndDate.Date;
            var due = model.RequestDueDate;
            if (ModelState.IsValid)
            {
                result = (flag: -2, message: "Need CRE Permission");
                if (GetCREIDFromClaim() > 0)
                {
                    var instance = TermDAO.Instance;
                    var currentDBTerm = instance.GetTermInfo(model.TermNumber);
                    if (model.StartDate > DateTime.Now)
                    {
                        if ((start.CompareTo(end) <= 0 && due.CompareTo(end) <= 0 && due.CompareTo(start) >= 0))
                        {
                            TimeSpan fourMonth = new TimeSpan(120, 0, 0, 0);
                            if (!(end.Subtract(start).CompareTo(fourMonth) < 0))
                            {
                                TermDTO previousTerm = instance.GetLastestAddedTerm();
                                if (previousTerm!= null && model.StartDate > previousTerm.EndDate)
                                {
                                    result = TermDAO.Instance.UpdateTerm(model);
                                }
                                else
                                {
                                    result = (flag: -90, message: $"Start date must after the previous end date term {previousTerm.TermName} ({previousTerm.StartDate:MM/dd/yyyy} - {previousTerm.EndDate:MM/dd/yyyy})");
                                }

                            }
                            else
                            {
                                result = (flag: -95, message: $"Start date of this semester must be after the it's end date ({end.ToString("MM/dd/yyyy")}) at least 4 months (~120 days)");
                            }
                        }
                        else
                        {
                            result = (flag: -96, message: "Start date must smaller than request due date and request date must smaller than end date");
                        }
                    }
                    else
                    {
                        result = (flag: -94, message: $"Term has been started, can't be updated anymore");
                    }
                }
            }
            return Json(new { Error = result.flag, Message = result.message });
        }
        [HttpGet("terms/{page:int}")]
        public IActionResult GetTermList(int page)
        {
            var (list, maxPage) = TermDAO.Instance.GetTermList(page == 0 ? 1 : page);
            return Json(new { Error = 0, Message = list.Count(), MaxPage = maxPage, TermList = list });
        }
        // *********** CRE Company Management ******************
        //CRE Company Management
        [HttpGet("companies/delete/{companyID:int}")]
        public IActionResult DeleteCompany(int companyID)
        {
            var result = (error: -2, message: "Need CRE Permission");
            if (GetCREIDFromClaim() > 0)
            {
                result = CompanyDAO.Instance.RemoveCompany(companyID);
            }
            return Json(new { Error = result.error, Message = result.message });
        }
        //View Companies List
        [HttpGet("companies/{page:int}/{name:=}")]
        public IActionResult Company(string name, int page, [FromQuery] int field = 0)
        {
            var (list, maxPage) = CompanyDAO.Instance.GetCompanyList(name, field, page);
            return Json(new { CompanyList = list, MaxPage = maxPage, Error = 0, Message = $"There are {list.Count} companies in page {page}" });
        }
        //View Company Info
        [HttpGet("companies/detail/{companyID:int}")]
        public IActionResult CompanyDetail(int companyID)
        {
            var company = CompanyDAO.Instance.GetCompanyDetail(companyID);
            return Json(new { Error = 0, Message = (company == null) + "", Company = company });
        }
        //View deactive/register companies/ 
        [HttpGet("companies/activate/{page:int}")]
        public IActionResult GetDeactivatedList(int page)
        {
            var (list, maxPage) = CompanyDAO.Instance.GetDeactivatedCompanyList(page == 0 ? 1 : page);
            return Json(new { Error = 0, Message = list.Count, companyList = list, maxPage = maxPage });
        }
        //Activate register company
        [HttpGet("activate/{companyID:int}/{status:int}")]
        public IActionResult ActivateCompany(int companyID, int status)
        {
            var result = (error: -2, message: "Need CRE Permission");
            if (GetCREIDFromClaim() != 0)
            {
                CompanyDTO company = CompanyDAO.Instance.GetCompanyDetail(companyID);
                string html = System.IO.File.ReadAllText("CR-email-status.html")
                .Replace("{{companyname}}", company.CompanyName)
                .Replace("{{email}}", company.Email)
                .Replace("{{phone}}", company.Phone)
                .Replace("{{address}}",company.Address)
                .Replace("{{website}}", company.WebSite);
                result = (error: -1, message: "invalid status");
                if (status == 2)
                {
                    html = html.Replace("{{status}}", "Rejected");
                    result = CompanyDAO.Instance.RejectCompanyRegister(companyID);
                }
                else if (status == 1)
                {
                    html.Replace("{{status}}", "Approved");
                    result = CompanyDAO.Instance.ActivateCompany(companyID);
                }
                EmailSender.SendHtmlEmail(company.Email,"OJT company status", html);
            }
            return Json(new { Error = result.error, Message = result.message });
        }
        // ********* CRE Student Management **************
        //View Student profile
        [HttpGet("students/profile/{studentID:=}")]
        public IActionResult ViewStudentProfile(string studentID)
        {
            int termNumber = GetCurrentTermFromClaim();
            var student = StudentDAO.Instance.GetStudentInfo(studentID);
            var studentReport = ReportDAO.Instance.GetReportDetail(studentID, termNumber);
            return Json(new { Error = 0, Message = $"{student != null}", Student = student, Result = studentReport });
        }
        //
        //View Students List
        //
        [HttpGet("students/{page:int}")]
        public IActionResult GetAllStudent([FromQuery] string search, int page, [FromQuery] int major = 0)
        {
            var (list, maxPage) = StudentDAO.Instance.GetStudentList(search, major, page);
            return Json(new { StudentList = list, MaxPage = maxPage, Error = 0, Message = list.Count > 0 });
        }
        //
        //UpdateStudent
        //
        [HttpPost("students/new")]
        public IActionResult AddNewStudent([FromBody] StudentInsertModel[] studentList)
        {
            var result = (flag: 2, message: "Model invalid");
            if (ModelState.IsValid)
            {
                result = (flag: -2, message: "Need CRE permission");
                if (GetCREIDFromClaim() > 0)
                {
                    if (studentList != null && studentList.Count() > 0)
                    {
                        StudentDAO dao = StudentDAO.Instance;
                        int count = 0;
                        foreach (var student in studentList)
                        {
                            if (dao.AddStudent(student).flag == 0) count++;
                        }
                        result.flag = 0;
                        int fail = studentList.Count() - count;
                        result.message = $"Success : {count}\n Fail: {fail}";
                        if (fail > 0)
                        {
                            result.flag = 1;
                            result.message += "\n Reason: Duplicate student's ID or email";
                        }
                        result.message = $"Success : {count}\n Fail: {fail}";
                        if (fail > 0) result.message += "\n Reason: Duplicate student's ID or email";
                    }
                }
            }
            return Json(new { Error = result.flag, Message = result.message });
        }
        [HttpPost("students/update")]
        public IActionResult UpdateStudent([FromForm] StudentUpdateModel student)
        {
            var result = (flag: 2, message: "Model invalid");
            if (ModelState.IsValid)
            {
                result = (flag: -2, message: "Need CRE permission");
                if (GetCREIDFromClaim() > 0)
                {
                    StudentDAO dao = StudentDAO.Instance;
                    result = dao.CREUpdateStudent(student);
                    result.message = $"Success";
                    result.flag = 0;
                }
            }
            return Json(new { Error = result.flag, Message = result.message });
        }
        [HttpGet("students/remove/{username:=}")]
        public IActionResult RemoveStudent(string username)
        {
            var result = (flag: -2, message: "Need CRE permission");
            if (GetCREIDFromClaim() > 0)
            {
                result = StudentDAO.Instance.RemoveStudent(username);
            }
            return Json(new { Error = result.flag, Message = result.message });
        }
        // ********* Request Management **********
        //For CRE's Request handling
        //
        [HttpPost("request")]
        public IActionResult HandleRequest([FromBody] RequestDTO request)
        {
            var result = (flag: 2, message: "Model Invalid");
            if (ModelState.IsValid)
            {
                result = (flag: -2, message: "Need CRE Permission");
                if ((request.CRE_ID = GetCREIDFromClaim()) > 0)
                {
                    result = RequestDAO.Instance.HandleRequest(request, GetCurrentTermFromClaim());
                }
            }
            return Json(new { Error = result.flag, Message = result.message });
        }
        [HttpGet("requests/{page:int}/{term:int?}")]
        public IActionResult RequestList(int page)
        {
            var (list, maxPage) = RequestDAO.Instance.GetStudentRequestList(page);
            return Json(new { RequestList = list, MaxPage = maxPage, Error = 0, Message = list.Count });
        }
        [HttpGet("request/detail/{requestID:int}")]
        public IActionResult RequestDetail(int requestID)
        {
            var request = RequestDAO.Instance.GetRequestDetail(requestID);
            return Json(new { Error = 0, Message = "", Request = request });
        }
        //
        //View Recruited Student List
        //
        [HttpGet("reports/{page:int}/{termNumber:int}")]
        public IActionResult RecruitedStudent([FromQuery] string search, int page, int termNumber)
        {
            TermDTO termDTO;
            var dao = TermDAO.Instance;
            if (termNumber == 0)
            {
                termDTO = dao.GetCurrentTerm();
                termNumber = termDTO.TermNumber;
            }
            else
            {
                termDTO = dao.GetTermInfo(termNumber);
            }
            var (list, maxPage) = ReportDAO.Instance.GetRecruitedStudentList(search, termNumber, page);
            return Json(new { Error = 0, Message = list.Count > 0, StudentList = list, MaxPage = maxPage, Term = new { TermNumber = termNumber, TermName = termDTO == null ? "" : termDTO.TermName } });
        }
        [HttpGet("reports/download")]
        public IActionResult ExportReportList()
        {
            var termNumber = GetCurrentTermFromClaim();
            var reportList = ReportDAO.Instance.GetCurrentTermReportList(termNumber);
            using (var xlWorkBook = new ClosedXML.Excel.XLWorkbook())
            {
                var reportSheet = xlWorkBook.Worksheets.Add("OJT Reports");
                var row = 1;
                reportSheet.Cell(row, 1).Value = "Semester";
                reportSheet.Cell(row, 2).Value = "StudentID";
                reportSheet.Cell(row, 3).Value = "FullName";
                reportSheet.Cell(row, 4).Value = "CompanyName";
                reportSheet.Cell(row, 5).Value = "Attendance";
                reportSheet.Cell(row, 6).Value = "Attitude";
                reportSheet.Cell(row, 7).Value = "Progress";
                reportSheet.Cell(row, 8).Value = "Average";
                reportSheet.Cell(row, 9).Value = "Status";

                foreach (var report in reportList)
                {
                    string status = "Not graded";
                    if (report.Attendance != null && report.Attitude != null && report.Grade != null)
                    {
                        int total = report.Attendance.Value + report.Attitude.Value + report.Grade.Value;
                        if (total < 150 || report.Attendance == 0 || report.Attitude == 0 || report.Grade == 0)
                        {
                            status = "Failed";
                        }
                        else
                        {
                            status = "Passed";
                        }

                    }
                    row++;
                    reportSheet.Cell(row, 1).Value = report.TermName;
                    reportSheet.Cell(row, 2).Value = report.StudentID;
                    reportSheet.Cell(row, 3).Value = report.FullName;
                    reportSheet.Cell(row, 4).Value = report.CompanyName;
                    reportSheet.Cell(row, 5).Value = report.Attendance;
                    reportSheet.Cell(row, 6).Value = report.Attitude;
                    reportSheet.Cell(row, 7).Value = report.Grade;
                    reportSheet.Cell(row, 8).Value = report.Average;
                    reportSheet.Cell(row, 9).Value = status;
                }
                using (var stream = new System.IO.MemoryStream())
                {
                    xlWorkBook.SaveAs(stream);
                    var reportListByteArray = stream.ToArray();
                    return File(reportListByteArray, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"OJTReports-TermNum-{termNumber}.xlsx");
                }
            }
        }
        private int GetCREIDFromClaim()
        {
            var CRE_ID = User.FindFirst("CRE_ID");
            return CRE_ID == null ? 0 : int.Parse(CRE_ID.Value);
        }
        private int GetCurrentTermFromClaim()
        {
            var termNumber = User.FindFirst("TermNumber");
            return termNumber == null ? 0 : int.Parse(termNumber.Value);
        }
    }
}
