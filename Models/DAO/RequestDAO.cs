using SWP391Group6Project.Models.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;

namespace SWP391Group6Project.Models.DAO
{
    public class RequestDAO : DAO
    {
        private static RequestDAO instance;
        private static object instanceLock = new object();
        public static RequestDAO Instance
        {
            get
            {
                lock (instanceLock)
                {
                    return instance == null ? instance = new RequestDAO() : instance;
                }
            }
        }
        private RequestDAO() : base() { }

        public (List<RequestDTO> list, int maxPage) GetStudentRequestList(int page = 1, int count = 10)
        {
            var result = (list: new List<RequestDTO>(), maxPage : 0);
            int pos = count * (page - 1) + 1;
            using (var con = CreateConnection())
            {
                string countQuery = " SELECT COUNT(Request_ID) FROM Requests r JOIN RequestStatus rs on r.RequestStatus = rs.StatusID WHERE rs.StatusID = 1 ;";
                string searchQuery =
                    $" SELECT TOP {count} Request_ID as 'RequestID', RequestType, TypeName, RequestTitle, StudentID, FullName, CompanyID, CompanyName, RequestStatus, StatusName, CreateDate, ChangeDate, Purpose, ProcessNote " +
                    " FROM (SELECT ROW_NUMBER() OVER(ORDER BY Request_ID DESC) as 'No', Request_ID, RequestType, TypeName, RequestTitle, r.StudentID, FullName, r.CompanyID, CompanyName, r.RequestStatus, rs.StatusName, CreateDate, ChangeDate, Purpose, ProcessNote " +
                          " From (Requests r JOIN RequestStatus rs ON r.RequestStatus = rs.StatusID)" +
                                " JOIN (Students s JOIN Users u ON s.Username = u.Username) ON r.StudentID = s.StudentID " +
                                " JOIN Companies c ON r.CompanyID = c.CompanyID " +
                                " JOIN RequestTypes rt ON r.RequestType = rt.TypeID " +
                          " WHERE rs.StatusID = 1 ) reqList " +
                    " WHERE reqList.No >= @start ";
                using (var multiQ = con.QueryMultiple(countQuery + searchQuery, new { Start = pos }))
                {
                    result.maxPage = (int)Math.Ceiling(multiQ.Read<double>().FirstOrDefault() / count);
                    result.list = multiQ.Read<RequestDTO>().ToList();
                }
            }
            return result;
        }

        public List<RequestDTO> GetOwnRequestList(string studentID)
        {
            var list = new List<RequestDTO>();
            using (var con = CreateConnection())
            {
                string searchQuery =
                          "SELECT  Request_ID as 'RequestID', RequestType, RequestTitle, StudentID, CompanyID, r.RequestStatus, rs.StatusName, CreateDate, ChangeDate, Purpose, ProcessNote " +
                          " From Requests r JOIN RequestStatus rs ON r.RequestStatus = rs.StatusID " +
                          " WHERE StudentID = @id ";
                list = con.Query<RequestDTO>(searchQuery, new { ID = studentID }).ToList(); 
            }
            return list;
        }

        public RequestDTO GetRequestDetail(int requestID)
        {
            RequestDTO request = null;
            using (var con = CreateConnection())
            {
                string query = " SELECT Request_ID as 'RequestID', RequestType, TypeName, RequestTitle, r.StudentID, FullName, r.CompanyID, CompanyName, r.RequestStatus, rs.StatusName, CreateDate, ChangeDate, Purpose, ProcessNote " +
                    " FROM (((Requests r JOIN RequestStatus rs ON r.RequestStatus = rs.StatusID)" +
                            " JOIN RequestTypes rt ON r.RequestType = rt.TypeID )" +
                            " JOIN (Students s JOIN Users u ON s.Username = u.Username) ON r.StudentID = s.StudentID) " +
                            " JOIN Companies c ON r.CompanyID = c.CompanyID " +
                    " WHERE Request_ID = @requestID";
                request = con.Query<RequestDTO>(query, new { RequestID = requestID }).FirstOrDefault();
            }
            return request;
        }

        public (int flag, string message) CreateRequest(StudentRequestToCREModel request)
        {
            var info = (flag: 1, message: "Create failed ");
            using (var con = CreateConnection())
            {
                if (con != null)
                {
                    using var transaction = con.BeginTransaction();
                    try
                    {
                        var obj = new
                        {
                            Type = request.RequestType,
                            Title = request.RequestTitle,
                            StudentID = request.StudentID,
                            CompanyID = request.CompanyID,
                            Purpose = request.Purpose
                        };
                        string query;
                        int count;
                        if (request.RequestType != 3)
                        {
                            query = " EXEC sp_Student_SendRequest @type, @title, @studentID, @companyID, @purpose ; ";
                            count = Convert.ToInt32(con.ExecuteScalar(query, obj, transaction: transaction));
                        } 
                        else
                        {
                            query =
                                " INSERT INTO Requests (RequestType, RequestTitle, StudentID, CompanyID, CreateDate, Purpose, RequestStatus) " +
                                " VALUES (@type, @title, @studentID, @companyID, CONVERT(date, getdate()), @purpose, 1) ";
                            count = con.Execute(query, obj, transaction: transaction);
                        }
                        
                        switch(count)
                        {
                            case -3:
                                info.flag = -3;
                                info.message += " - Please choose companies that match with your major.";
                                break;
                            case -2:
                                info.flag = -2;
                                info.message += " - You haven't been recruited yet.";
                                break;
                            case -1:
                                info.flag = -1;
                                info.message += " - You are in OJT OR already Passed OJT. No need to send request";
                                break;
                            case 0:
                                info.flag = 3;
                                info.message += " - Register request's deadline is already due";
                                break;
                            case 1:
                                info.flag = 0;
                                info.message = "Create Successfully";
                                transaction.Commit();
                                break;
                            default:
                                info.message += " - Your transfer request is processing ";
                                break;
                        }
                    } catch (Exception)
                    {
                        transaction.Rollback();                       
                    }
                }
            }
            return info;
        }

        public (int flag, string message) HandleRequest(RequestDTO request, int currTerm)
        {
            switch(request.RequestType)
            {
                case 1:
                    return HandleRegister(request, currTerm);
                case 2:
                    return HandleTransfer(request, currTerm);
                case 3:
                    return HandleCancel(request, currTerm);
                default: 
                    return (flag: 1, message: "Request Update Failed");
            }
        }

        public (int flag, string message) HandleRegister(RequestDTO request, int term)
        {
            var info = (flag: 1, message: "Request Update Failed - Student has already registered"); 
            using (var con = CreateConnection())
            {
                if (con != null)
                {
                    using var transaction = con.BeginTransaction();
                    try
                    {
                        string queryRequest =
                            " UPDATE Requests " +
                            " SET RequestStatus = @status, ChangeDate = CONVERT(date, getdate()), CRE_ID = @creID, ProcessNote = @note " +
                            " WHERE Request_ID = @requestID ";
                        int count = con.Execute(queryRequest, new { Status = request.RequestStatus, CREID = request.CRE_ID, Note = request.ProcessNote, RequestID = request.RequestID }, transaction: transaction);
                        if (count == 1)
                        {
                            if (request.RequestStatus == 2)
                            {
                                string queryRecruitment =
                                    " INSERT INTO Recruitment (StudentID, CompanyID, TermNumber, RecruitmentStatus) " +
                                    " VALUES (@studentID, @companyID, @term, 3) ";
                                count = con.Execute(queryRecruitment, new { StudentID = request.StudentID, CompanyID = request.CompanyID, Term = term }, transaction: transaction);                                
                            }
                            if (count == 1)
                            {
                                info.message = "Updated";
                                info.flag = 0;
                                transaction.Commit();
                            }
                        }
                    }
                    catch (Exception)
                    {
                        transaction.Rollback();
                    }
                }
            }

            return info;
        }
        public (int flag, string message) HandleTransfer(RequestDTO request, int term)
        {
            var info = (flag: 1, message: "Request Update Failed - Student has already registered to this company");
            using (var con = CreateConnection())
            {
                if (con != null)
                {
                    using var transaction = con.BeginTransaction();
                    try
                    {
                        string queryRequest =
                            " UPDATE Requests " +
                            " SET RequestStatus = @status, ChangeDate = CONVERT(date, getdate()), CRE_ID = @creID, ProcessNote = @note " +
                            " WHERE Request_ID = @requestID ";
                        int count = con.Execute(queryRequest, new { Status = request.RequestStatus, CREID = request.CRE_ID, Note = request.ProcessNote, RequestID = request.RequestID }, transaction: transaction);
                        if (count == 1)
                        {
                            if (request.RequestStatus == 2)
                            {
                                string queryRecruitment =
                                        " INSERT INTO Recruitment (StudentID, CompanyID, TermNumber, RecruitmentStatus) " +
                                        " VALUES (@studentID, @companyID, @term,3) "; 
                                var param = new
                                {
                                    StudentID = request.StudentID,
                                    CompanyID = request.CompanyID,
                                    Term = term
                                };
                                count = con.Execute(queryRecruitment, param, transaction: transaction);
                                if (count == 1)
                                {
                                    string queryReport =
                                        " DELETE FROM OJT_Reports " +
                                        " WHERE StudentID = @studentID AND TermNumber = @term ";
                                    con.Execute(queryReport, param, transaction: transaction);
                                }
                            }
                            if (count == 1)
                            {
                                info.message = "Updated";
                                info.flag = 0;
                                transaction.Commit();
                            }
                        }
                    }
                    catch (Exception)
                    {
                        transaction.Rollback();
                    }
                }
            }
            return info;
        }
        public (int flag, string message) HandleCancel(RequestDTO request, int term)
        {
            var info = (flag: 1, message: "Request Update Failed");
            using (var con = CreateConnection())
            {
                if (con != null)
                {
                    using var transaction = con.BeginTransaction();
                    try
                    {
                        string queryRequest = 
                            " UPDATE Requests " +
                            " SET RequestStatus = @status, ChangeDate = CONVERT(date, getdate()), CRE_ID = @creID, ProcessNote = @note " +
                            " WHERE Request_ID = @requestID ";
                        int count = con.Execute(queryRequest, new { Status = request.RequestStatus, CREID = request.CRE_ID, Note = request.ProcessNote, RequestID = request.RequestID }, transaction:transaction);
                        if (count == 1)
                        {
                            if (request.RequestStatus == 2)
                            {
                                string queryReport =
                                    " DELETE FROM OJT_Reports " +
                                    " WHERE StudentID = @studentID AND TermNumber = @term ";
                                con.Execute(queryReport, new { StudentID = request.StudentID, CompanyID = request.CompanyID, Term = term }, transaction: transaction);
                            }
                            if (count == 1)
                            {
                                info.message = "Updated";
                                info.flag = 0;
                                transaction.Commit();
                            }
                        }
                    } catch (Exception)
                    {
                        transaction.Rollback();
                    }
                }
            }
            return info;
        }
    }
}
