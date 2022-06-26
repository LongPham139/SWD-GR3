using Dapper;
using System.Linq;
using SWP391Group6Project.Models.DTO;
using System;
using System.Collections.Generic;
using Microsoft.Data.SqlClient;
namespace SWP391Group6Project.Models.DAO
{
    public class StudentDAO : DAO
    {
        private static StudentDAO instance;
        private static object instanceLock = new object();
        public static StudentDAO Instance
        {
            get
            {
                lock (instanceLock)
                {
                    return instance == null ? instance = new StudentDAO() : instance;
                }
            }
        }
        private StudentDAO() : base() { }

        public StudentDTO GetStudentInfo(string id)
        {
            StudentDTO std = null;
            using (var con = CreateConnection())
            {
                string query = " Select u.Username, FullName, Email, StudentID, " +
                                        " DateOfBirth, Gender, Address, Phone, s.Major," +
                                        " c.FieldName, CV_URL, OJTStatus, u.RoleID " +
                               " FROM (Users u JOIN Students s ON u.Username = s.Username) JOIN CareerFields c on c.Field_ID = s.Major " +
                               " WHERE u.Username = @id OR s.StudentID = @id ";
                std = con.Query<StudentDTO>(query, new { ID = id }).FirstOrDefault();
            }
            return std;
        }

        public (List<StudentDTO> list, int maxPage) GetStudentList(string search, int major, int page = 1, int count = 20)
        {
            var result = (list: new List<StudentDTO>(), maxPage: 0);
            using (var con = CreateConnection())
            {
                string query = 
                    " SELECT s.StudentID, FullName, s.Username, Email, Major, FieldName, DateOfBirth, Gender, Address, Phone, AccountStatus " +
                    " FROM ((Users u JOIN Students s ON u.Username = s.Username " +
                                 " JOIN CareerFields cf ON s.Major = cf.Field_ID) " +
                                 " LEFT JOIN OJT_Reports r ON s.StudentID = r.StudentID)" +
                                 " LEFT JOIN Requests req ON s.StudentID = req.StudentID " +
                    " WHERE (s.StudentID = @id OR FullName LIKE @search) AND Major LIKE @major AND AccountStatus = 1 AND r.StudentID IS NULL AND req.StudentID IS NULL ";
                var list = con.Query<StudentDTO>(query, new { ID = search, Search = $"%{search}%", Major = major == 0 ? "%%" : major + "" });
                result.maxPage = (int)Math.Ceiling((float)list.Count() / count);
                result.list = list.Skip(count * (page - 1)).Take(count).ToList();
            }
            return result;
        }

        public (List<ReportDTO> list, int maxPage) GetThisTermCompanyStudentList(string search, int companyID, int termNumber, int page = 1, int count = 10)
        {
            var result = (list: new List<ReportDTO>(), maxPage: 0);
            using (var con = CreateConnection())
            {
                string querySearch =
                    "SELECT FullName, s.StudentID, Attendance, Attitude, Grade,ROUND(CAST((Attendance + Attitude + Grade ) AS FLOAT)/3, 0) AS 'Average' " +
                          " FROM (Students s JOIN OJT_Reports r ON s.StudentID = r.StudentID) JOIN Users u ON s.Username = u.Username " +
                          " WHERE r.CompanyID = @companyId AND TermNumber = @term AND (FullName LIKE @name OR s.StudentID = @studentID) ";
                var param = new
                {
                    Name = $"%{search}%",
                    StudentID = search,
                    CompanyID = companyID,
                    Term = termNumber
                };
                var list = con.Query<ReportDTO>(querySearch, param);
                result.maxPage = (int)Math.Ceiling((float)list.Count() / count);
                result.list = list.Skip(count * (page - 1)).Take(count).ToList();
            }
            return result;
        }

        public (int flag, string message) UpdateStudentProfile(StudentDTO student)
        {
            var result = (flag: 1, message: "Update Failed");
            using (var con = CreateConnection())
            {
                if (con != null)
                {
                    using var transaction = con.BeginTransaction();
                    try
                    {
                        string updateUser =
                            " UPDATE Users " +
                            " SET FullName = @fullName " +
                            " WHERE Username = @username ";
                        int count = con.Execute(updateUser, new { FullName = student.FullName, Username = student.Username }, transaction: transaction);
                        if (count == 1)
                        {
                            string updateStudent =
                                " UPDATE Students " +
                                " SET DateOfBirth = @dob, Address = @address, Phone = @phone ";
                            if (!string.IsNullOrEmpty(student.CV_URL)) updateStudent += ", CV_URL = @url ";
                            updateStudent += " WHERE Username = @username ";
                            var param = new
                            {
                                DOB = student.DateOfBirth.Date.AddDays(1),
                                Address = student.Address,
                                Phone = student.Phone,
                                URL = student.CV_URL.Trim(),
                                Username = student.Username
                            };
                            count = con.Execute(updateStudent, param, transaction: transaction);
                            if (count == 1)
                            {
                                result.flag = 0;
                                result.message = "Updated";
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
            return result;
        }

        public (int flag, string message) AddStudent(StudentInsertModel student)
        {
            var result = (flag: 1, message: "Failed to add student - Dupplicate");
            using (var con = CreateConnection())
            {
                using var transaction = con.BeginTransaction();
                try
                {
                    string email = student.Email;
                    string username = email.Substring(0, email.IndexOf('@'));
                    string updateUser =
                        "  INSERT INTO Users (Username, Password, FullName, Email, RoleID, AccountStatus) " +
                        "  VALUES (@username, @password, @fullName, @email, 2, 1) ";
                    var paramUser = new
                    {
                        Username = username,
                        Password = HashPassword(username),
                        FullName = student.FullName,
                        Email = student.Email
                    };
                    int count = con.Execute(updateUser, paramUser, transaction: transaction);
                    if (count == 1)
                    {
                        string updateStudent =
                            "  INSERT INTO Students (StudentID, Username, DateOfBirth, Gender, Address, Phone, Major, OJTStatus) " +
                            "  VALUES (@studentID, @username, @dateOfBirth, @gender, @address, @phone, @major, 0) ";
                        var paramStudent = new
                        {
                            StudentID = student.StudentID,
                            Username = username,
                            DateOfBirth = student.DateOfBirth,
                            Gender = student.Gender,
                            Address = student.Address,
                            Phone = student.Phone,
                            Major = student.Major
                        };
                        count = con.Execute(updateStudent, paramStudent, transaction: transaction);
                        if (count == 1)
                        {
                            result.flag = 0;
                            result.message = "Added Successfully";
                            transaction.Commit();
                        }
                    }
                }
                catch (Exception)
                {
                    transaction.Rollback();
                }

            }
            return result;
        }

        public (int flag, string message) CREUpdateStudent(StudentUpdateModel student)
        {
            var result = (flag: 1, message: "Update Failed");
            using (var con = CreateConnection())
            {
                if (con != null)
                {
                    using var transaction = con.BeginTransaction();
                    try
                    {
                        string updateUser =
                            " UPDATE Users " +
                            " SET FullName = @fullName, Email = @email " +
                            " WHERE Username = @username ";
                        var paramUser = new
                        {
                            FullName = student.FullName,
                            Email = student.Email,
                            Username = student.Username
                        };
                        int count = con.Execute(updateUser, paramUser, transaction: transaction);
                        if (count == 1)
                        {
                            result = (flag: 1, message: "Update Failed - Duplicated");
                            string updateStudent =
                                " UPDATE Students " +
                                " SET DateOfBirth = @dob, Gender = @gender, Address = @address, Phone = @phone, Major = @major " +
                                " WHERE Username = @username ";
                            var paramStudent = new
                            {
                                DOB = student.DateOfBirth,
                                Gender = student.Gender,
                                Address = student.Address,
                                Phone = student.Phone,
                                Major = student.Major,
                                Username = student.Username
                            };
                            count = con.Execute(updateStudent, paramStudent, transaction: transaction);
                            if (count == 1)
                            {
                                result.flag = 0;
                                result.message = "Updated";
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
            return result;
        }

        public (int flag, string message) RemoveStudent(string username)
        {
            var result = (flag: -1, message: "Failed to remove Student - Student's username not found");
            using (var con = CreateConnection())
            {
                if (con != null)
                {
                    using var transaction = con.BeginTransaction();
                    try
                    {
                        string query = " EXEC sp_CRE_RemoveStudent @username ";
                        int count = Convert.ToInt32(con.ExecuteScalar(query, new { Username = username }, transaction: transaction));
                        if (count > 0)
                        {
                            transaction.Commit();
                            result = (flag: 0, message: "Successfully Updated");
                        }
                        else if (count == 0)
                        {
                            result = (flag: 1, message: "Failed to remove - Student is applying to or already in a company");
                        }
                    }
                    catch
                    {
                        transaction.Rollback();
                    }
                }
            }
            return result;
        }
    }
}
