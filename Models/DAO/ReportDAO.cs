
using SWP391Group6Project.Models.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using Dapper;
namespace SWP391Group6Project.Models.DAO
{
    public class ReportDAO : DAO
    {
        private static ReportDAO instance;
        private static object instanceLock = new object();
        public static ReportDAO Instance
        {
            get
            {
                lock (instanceLock)
                {
                    return instance == null ? instance = new ReportDAO() : instance;
                }
            }
        }
        private ReportDAO() : base() { }
        public List<ReportDTO> GetCurrentTermReportList(int termNumber)
        {
            List<ReportDTO> list = new List<ReportDTO>();
            using (var con = CreateConnection())
            {
                string query =
                    " SELECT r.TermNumber, TermName, r.StudentID, FullName, CompanyName, CR_ID, Attendance, Attitude, Grade, ROUND(CAST((Attendance + Attitude + Grade ) AS FLOAT)/3, 0) AS 'Average' " +
                    " FROM OJT_Reports r JOIN Terms t ON r.TermNumber = t.TermNumber " +
                          " JOIN Companies c ON r.CompanyID = c.CompanyID " +
                          " JOIN Students s ON r.StudentID = s.StudentID " +
                          " JOIN Users u ON u.Username = s.Username " +
                    " WHERE r.TermNumber = @termNumber ";
                list = con.Query<ReportDTO>(query, new { TermNumber = termNumber }).ToList();
            }
            return list;
        }

        public List<ReportDTO> GetCompanyCurrentTermReportList(int termNumber, int companyID)
        {
            List<ReportDTO> list = new List<ReportDTO>();
            using (var con = CreateConnection())
            {
                string query =
                    " SELECT r.TermNumber, TermName, StudentID, r.CompanyID, CompanyName, CR_ID, Attendance, Attitude, Grade, ROUND(CAST((Attendance + Attitude + Grade ) AS FLOAT)/3, 0) AS 'Average' " +
                    " FROM OJT_Reports r JOIN Terms t ON r.TermNumber = t.TermNumber " +
                          " JOIN Companies c ON r.CompanyID = c.CompanyID" +
                    " WHERE r.TermNumber = @termNumber AND r.CompanyID = @companyID ";
                list = con.Query<ReportDTO>(query, new { TermNumber = termNumber , CompanyID = companyID}).ToList();
            }
            return list;
        }

        public ReportDTO GetReportDetail(string studentID, int termNumber)
        {
            ReportDTO rp = null;
            using (var con = CreateConnection())
            {
                string query = " SELECT r.CompanyID, CompanyName, r.TermNumber, TermName, Attendance, Attitude, Grade, ROUND(CAST((Attendance + Attitude + Grade ) AS FLOAT)/3, 0) AS 'Average' " +
                    " FROM ((OJT_Reports r JOIN (Students s JOIN Users u ON s.Username = u.Username) ON r.StudentID = s.StudentID) " +
                           " JOIN Companies c ON r.CompanyID = c.CompanyID) " +
                           " JOIN Terms t on r.TermNumber = t.TermNumber " +
                    " WHERE r.StudentID = @studentID AND r.TermNumber = @term ";
                rp = con.Query<ReportDTO>(query, new { StudentID = studentID, Term = termNumber }).FirstOrDefault();
            }
            return rp;
        }

        public (int flag, string message) UpdateReport(ReportDTO report)
        {
            var result = (flag: 1, message: "Update Failed");
            using (var con = CreateConnection())
            {
                if (con!=null)
                {
                    using var transaction = con.BeginTransaction();
                    try
                    {
                        string query = " UPDATE OJT_Reports " +
                            " SET CR_ID = @CRID, Attendance = @attendance, Attitude = @attitude, Grade = @grade " +
                            " WHERE StudentID = @student AND TermNumber = @term AND CompanyID = @company ";
                        var param = new
                        {
                            CRID = report.CR_ID,
                            Attendance = report.Attendance,
                            Attitude = report.Attitude,
                            Grade = report.Grade, 
                            Student = report.StudentID, 
                            Term = report.TermNumber, 
                            Company = report.CompanyID
                        };
                        int row = con.Execute(query, param, transaction: transaction);
                        if (row == 1)
                        {
                            if (report.Grade + report.Attendance + report.Attitude >= 150 && report.Grade != 0 && report.Attendance != 0 && report.Attitude != 0)
                            {
                                string queryOJTStatus = " UPDATE Students " +
                                    " SET OJTStatus = 1 " +
                                    " WHERE StudentID = @studentID ";
                                con.Execute(queryOJTStatus, new { StudentID = report.StudentID }, transaction:transaction);
                            }
                            result.flag = 0;
                            result.message = "Report Updated";
                            transaction.Commit();
                        }
                    }
                    catch (Exception)
                    {
                        transaction.Rollback();
                        throw;
                    }
                }  
            }
            return result;
        }

        public (List<ReportDTO> list, int maxPage) GetRecruitedStudentList(string search = "", int termNumber = 0, int page = 1, int count = 10)
        {
            var info = (list: new List<ReportDTO>(), maxPage:0);
            using (var con = CreateConnection())
            {
                string querySearch =
                    " SELECT r.StudentID, FullName, r.CompanyID, CompanyName, r.TermNumber, TermName, Attendance, Attitude, Grade, ROUND(CAST((Attendance + Attitude + Grade ) AS FLOAT)/3, 0) AS 'Average' " +
                    " FROM (((OJT_Reports r JOIN Companies c ON r.CompanyID = c.CompanyID) " +
                                   " JOIN Students s ON r.StudentID = s.StudentID) " +
                                   " JOIN Users u ON s.Username = u.Username) " +
                                   " JOIN Terms t ON r.TermNumber = t.TermNumber " +
                    " WHERE (r.StudentID = @studentID OR FullName LIKE @fullName) AND r.TermNumber = @termNumber ";
                var param = new
                {
                    StudentID = search,
                    FullName = $"%{search}%",
                    TermNumber = termNumber
                };
                var list = con.Query<ReportDTO>(querySearch, param);
                info.maxPage = (int)Math.Ceiling((float)list.Count() / count);
                info.list = list.Skip(count * (page - 1)).Take(count).ToList();
            }
            return info;
        } 
    }
}
