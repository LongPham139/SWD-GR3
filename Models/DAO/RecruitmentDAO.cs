using Dapper;
using SWP391Group6Project.Models.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SWP391Group6Project.Models.DAO
{
    public class RecruitmentDAO : DAO
    {
        private static RecruitmentDAO instance;
        private static object instanceLock = new object();
        public static RecruitmentDAO Instance
        {
            get
            {
                lock (instanceLock)
                {
                    return instance == null ? instance = new RecruitmentDAO() : instance;
                }
            }
        }
        private RecruitmentDAO() : base() { }

        public StudentApplyResult GetStudentApplyRequest(int companyID, string studentID, int termNumber)
        {
            StudentApplyResult result = null;
            using (var con = CreateConnection())
            {
                string query =
                    " SELECT t.TermNumber, TermName, s.StudentID, FullName, u.Email, CompanyName, StatusName " +
                    " FROM Students s JOIN Users u ON s.Username = u.Username " +
                                    " JOIN Recruitment r ON s.StudentID = r.StudentID " +
                                    " JOIN RecruitmentStatus rs ON r.RecruitmentStatus = rs.StatusID" +
                                    " JOIN Companies c ON r.CompanyID = c.CompanyID " +
                                    " JOIN Terms t ON r.TermNumber = t.TermNumber " +
                    " WHERE r.StudentID = @studentID AND r.companyID = @companyID AND r.TermNumber = @termNumber ";
                var param = new
                {
                    StudentID = studentID,
                    CompanyID = companyID,
                    TermNumber = termNumber
                };
                result = con.Query<StudentApplyResult>(query, param).FirstOrDefault();
            }
            return result;
        }
        public (List<RecruitmentDTO> list, int maxPage) GetInterviewRequest(int companyID, int page = 1, int count = 10)
        {
            var result = (list: new List<RecruitmentDTO>(), maxPage : 0);
            using (var con = CreateConnection())
            {
                string searchQuery =
                    " SELECT s.StudentID, u.FullName, r.RecruitmentStatus, rs.StatusName " +
                    " From ((Recruitment r JOIN Students s ON r.StudentID = s.StudentID) " +
                            " JOIN Users u ON u.Username = s.Username) JOIN RecruitmentStatus rs ON r.RecruitmentStatus = rs.StatusID " +
                    " WHERE CompanyID = @companyID AND RecruitmentStatus = 3 ";
                var list = con.Query<RecruitmentDTO>(searchQuery, new { CompanyID = companyID });
                result.maxPage = (int)Math.Ceiling((float)list.Count() / count);
                result.list = list.Skip(count * (page - 1)).Take(count).ToList();
            }
            return result;
        }

        public (List<RecruitmentDTO> list, int maxPage) GetRecruitmentHistory(string studentID, int termNumber, int page = 1, int count = 10)
        {
            var result = (list: new List<RecruitmentDTO>(), maxPage: 0);
            int pos = count * (page - 1) + 1;
            using (var con = CreateConnection())
            {
                string countQuery = " SELECT COUNT(*) FROM Recruitment WHERE StudentID = @studentID AND TermNumber = @term ; ";
                string searchQuery =
                    $" SELECT TOP {count} CompanyID, CompanyName, StatusName " +
                    " FROM ( SELECT ROW_NUMBER() OVER (ORDER BY (r.CompanyID)) AS 'No' , r.CompanyID, c.CompanyName, rs.StatusName" +
                           " FROM (Recruitment r JOIN Companies c ON r.CompanyID = c.CompanyID ) JOIN RecruitmentStatus rs ON r.RecruitmentStatus = rs.StatusID " +
                           " WHERE TermNumber = @term AND StudentID = @studentID ) result" +
                    " WHERE result.No >= @start ";
                var param = new
                {
                    StudentID = studentID,
                    Term = termNumber,
                    Start = pos
                };
                using (var multiQ = con.QueryMultiple(countQuery + searchQuery, param))
                {
                    result.maxPage = (int)Math.Ceiling(multiQ.Read<double>().FirstOrDefault() / count);
                    result.list = multiQ.Read<RecruitmentDTO>().ToList();
                }
            }
            return result;
        }

        public (int flag, string message) ProcessApplyRequest(string studentID, int companyID, int crID, int termNumber, int status)
        {
            var result = (flag:1, message:"Process Failed - Student is already recruited");
            using (var con = CreateConnection())
            {
                if (con != null)
                {
                    using var transaction = con.BeginTransaction();
                    try
                    {
                        string query = " UPDATE Recruitment " +
                                       " SET RecruitmentStatus = @status " +
                                       " WHERE StudentID = @studentID AND CompanyID = @companyID AND TermNumber = @termNumber AND RecruitmentStatus = 3 ";
                        int count = con.Execute(query, new { StudentID = studentID, CompanyID = companyID, TermNumber = termNumber, Status = status }, transaction: transaction);
                        if (count == 1)
                        {
                            if (status == 1)
                            {
                                string queryReport =
                                    " INSERT INTO OJT_Reports (TermNumber, StudentID, CompanyID, CR_ID) " +
                                    " VALUES (@term, @studentID, @companyID, @crID) ";
                                count = con.Execute(queryReport, new { Term = termNumber, StudentID = studentID, CompanyID = companyID, CRID = crID }, transaction:transaction);
                                if (count == 1)
                                {
                                    query = " DELETE FROM Recruitment " +
                                            " WHERE StudentID = @studentID AND TermNumber = @termNumber AND CompanyID != @CompanyID ";
                                    con.Execute(query, new { StudentID = studentID, CompanyID = companyID, TermNumber = termNumber, Status = status }, transaction: transaction);
                                }
                            }
                            if (count == 1)
                            {
                                result.flag = 0;
                                result.message = "Student Recruited";
                                transaction.Commit();
                            }
                        }
                    } catch(Exception)
                    {
                        transaction.Rollback();
                        result = ProcessApplyRequest(studentID, companyID, crID, termNumber, 2);
                        result.flag = -1;
                        result.message = "Student is already recruited by the other company, Auto Rejected";
                    }
                }
            }
            return result;
        }
    }
}
