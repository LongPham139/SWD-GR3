using Dapper;
using System.Linq;
using System.Data;
using System;
using SWP391Group6Project.Models.DTO;
namespace SWP391Group6Project.Models.DAO
{ 
    public class UserDAO : DAO
    {
        private static UserDAO instance;
        private static object instanceLock = new object();
        public static UserDAO Instance
        {
            get
            {
                lock (instanceLock)
                {
                    return instance == null ? instance = new UserDAO() : instance;
                }
            }
        }
        private UserDAO() : base() { }
        public dynamic Login(string username, string password)
        {
            dynamic user = null;
            using (var con = CreateConnection())
            {
                string query = " SELECT u.Username, FullName, Email, role.RoleID, role.RoleName, StudentID, CRE_ID, CR_ID, CompanyID " +
                    " FROM (((Users u LEFT JOIN Students s ON u.Username = s.Username) " +
                                  " LEFT JOIN CRs cr ON u.Username = cr.Username) " +
                                  " LEFT JOIN CREs cre ON u.Username = cre.Username )" +
                                  " JOIN Roles role ON u.RoleID = role.RoleID" +
                    " WHERE u.Username = @username AND Password = @password AND AccountStatus = 1 ";
                user = con.Query<dynamic>(query, new { Username = username, Password = HashPassword(password) }).FirstOrDefault();
            }
            return user;
        }
        public dynamic LoginGoogle(string email)
        {
            dynamic user = null;
            using (var con = CreateConnection())
            {
                string query = 
                    " SELECT u.Username, FullName, Email, role.RoleID, role.RoleName, StudentID, CRE_ID, CR_ID, CompanyID " +
                    " FROM (((Users u LEFT JOIN Students s ON u.Username = s.Username) " +
                                  " LEFT JOIN CRs cr ON u.Username = cr.Username) " +
                                  " LEFT JOIN CREs cre ON u.Username = cre.Username )" +
                                  " JOIN Roles role ON u.RoleID = role.RoleID" +
                    " WHERE Email = @email AND AccountStatus = 1 ";
                user = con.Query<dynamic>(query, new { Email = email }).FirstOrDefault();
            }
            return user;
        }
        public bool Register(string username, string password, string fullName, string email, int roleID)
        {
            bool valid = false;
            using (var con = CreateConnection())
            {
                if (con!=null)
                {
                    using var transaction = con.BeginTransaction();
                    try
                    {
                        string query = " INSERT INTO Users (Username, Password, FullName, Email, RoleID) " +
                                       " VALUES (@username, @password, @name, @email, @roleID, 1) ";
                        valid = con.Execute(query, new { Username = username, Password = HashPassword(password), Name = fullName, Email = email, RoleID = roleID }, transaction : transaction) == 1;
                    } catch (Exception)
                    {
                        transaction.Rollback();
                    }
                }
            }  
            return valid;
        } 

        public (int flag, string message) CheckExist(string username, string email)
        {
            var info = (flag : 0, message : "");
            using (var con = CreateConnection())
            {
                string query = " SELECT Username, Email " +
                    " FROM Users " +
                    " WHERE Username = @username OR Email = @email ";
                var userList = con.Query<UserDTO>(query, new { Username = username, Email = email }).ToList();
                if (userList != null)
                {
                    info.flag = 1;
                    var user = from u in userList
                               where u.Username.Equals(username)
                               select u;
                    if (user != null) info.message = "Username is Existed";
                    else info.message = "Email is Existed";
                }
            }
            return info;
        }

        public (int flag, string message) ChangePassword(string username, string oldPassword, string newPassword) {
            var info = (flag: 1, message: "Old Password Incorrect | New Password must different from the old.");
            using(var con = CreateConnection())
            {
                if (con!= null)
                {
                    using var transaction = con.BeginTransaction();
                    try
                    {
                        string query = " UPDATE Users " +
                            " SET Password = @confirm " +
                            " WHERE Username = @username AND Password = @password AND Password != @confirm ";
                        if (con.Execute(query, new { Username = username, Password = HashPassword(oldPassword), Confirm = HashPassword(newPassword) }, transaction : transaction) == 1)
                        {
                            transaction.Commit();
                            info.flag = 0;
                            info.message = "Password Updated";
                        }
                    }
                    catch (ArgumentException)
                    {
                        transaction.Rollback();
                    }
                }
            }
            return info;
        }        
    }
}