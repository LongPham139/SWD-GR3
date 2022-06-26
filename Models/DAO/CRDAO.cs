using Dapper;
using SWP391Group6Project.Models.DTO;
using System.Linq;
using System.Collections.Generic;
using System;
using Microsoft.Data.SqlClient;

namespace SWP391Group6Project.Models.DAO
{
    public class CRDAO : DAO
    {
        private static CRDAO instance;
        private static object instanceLock = new object();
        public static CRDAO Instance
        {
            get
            {
                lock (instanceLock)
                {
                    return instance == null ? instance = new CRDAO() : instance;
                }
            }
        }
        private CRDAO() : base() { }

        public (int flag, string message) AddNewCR(CompanyDTO company, CRDTO cr, string password)
        {
            var info = (flag: 1, message: "Register Failed - Duplicated Company Name or Email");
            using (var con = CreateConnection())
            {
                if (con != null)
                {
                    using var transaction = con.BeginTransaction();
                    try
                    {
                        string query =
                                " INSERT INTO Companies (CompanyName, Address, Phone, Email, WebSite, ActiveStatus) " +
                                " VALUES (@name, @address, @phone, @email, @web, 0) ; " +
                                " SELECT SCOPE_IDENTITY() AS 'CompanyID' ";
                        var param = new
                        {
                            Name = company.CompanyName,
                            Address = company.Address,
                            Phone = company.Phone,
                            Email = company.Email,
                            Web = company.WebSite,
                        };
                        int companyID = Convert.ToInt32(con.ExecuteScalar(query, param, transaction: transaction));
                        if (companyID > 0)
                        {
                            info = (flag: 2, message: "Register Failed - Duplicate username");
                            string queryCF =
                                " INSERT INTO CompanyFields (CompanyID, FieldID) " +
                                " VALUES (@companyID, 1) ;";
                            string queryUser =
                                " INSERT INTO Users (Username, Password, FullName, Email, RoleID, AccountStatus)" +
                                " VALUES (@username, @password, @fullName, @email, 3, 0) ";
                            var user = new
                            {
                                CompanyID = companyID,
                                Username = cr.Username,
                                Password = HashPassword(password),
                                FullName = cr.FullName,
                                Email = cr.Email
                            };
                            int count = con.Execute(queryCF + queryUser, user, transaction: transaction);
                            if (count > 0)
                            {
                                string queryCR = " INSERT INTO CRs (CompanyID, Username) " +
                                    " VALUES (@companyID, @username) ";
                                count = con.Execute(queryCR, new { CompanyID = companyID, Username = cr.Username }, transaction: transaction);
                                if (count == 1)
                                {
                                    info.message = "CR Created";
                                    info.flag = 0;
                                    transaction.Commit();
                                }
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
        public (int, string) CheckCompanyExsit(string username, string email, string companyName)
        {
            var info = (flag: -1, message: "Failed to register");
            using (var con = CreateConnection())
            {
                string queryUser =
                    " SELECT TOP 1 Username, Email" +
                    " FROM Users " +
                    " WHERE Username = @username OR Email = @email ;";
                string queryCompany =
                    " SELECT TOP 1 CompanyName, Email " +
                    " FROM Companies " +
                    " WHERE CompanyName = @name OR Email = @email ";
                var param = new
                {
                    Username = username,
                    Email = email,
                    name = companyName
                };
                using (var multiQ = con.QueryMultiple(queryUser + queryCompany, param))
                {
                    var user = multiQ.Read<UserDTO>().FirstOrDefault();
                    var company = multiQ.Read<CompanyDTO>().FirstOrDefault();
                    if (user == null && company == null)
                    {
                        info = (flag: 0, message: "An email has been sended, please verify your email");
                    }
                    else
                    {
                        if (user!= null)
                        {
                            if (email.Equals(user.Email)) info.message += " - This email is registered";
                            else
                            {
                                info = (flag: -2, message: "Failed to register - Username is registered");
                            }
                        } else if (company != null)
                        {
                            if (email.Equals(company.Email)) info.message += " - This email is registered";
                            else
                            {
                                info = (flag: -3, message: "Failed to register - Company Name is duplicated");
                            }
                        }
                    }
                }
            }
            return info;
        }
    }
}
