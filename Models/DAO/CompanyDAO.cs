using SWP391Group6Project.Models.DTO;
using Dapper;
using System;
using System.Collections.Generic;
using System.Linq;

namespace SWP391Group6Project.Models.DAO
{
    public class CompanyDAO : DAO
    {
        private static CompanyDAO instance;
        private static object instanceLock = new object();
        public static CompanyDAO Instance
        {
            get
            {
                lock (instanceLock)
                {
                    return instance == null ? instance = new CompanyDAO() : instance;
                }
            }
        }
        private CompanyDAO() : base() {}

        public (int flag, string message) ActivateCompany(int companyID)
        {
            var info = (flag: 1, message: "Activate failed - Company ID not found");
            using (var con = CreateConnection())
            {
                if (con != null)
                {
                    
                    using var transaction = con.BeginTransaction();
                    try
                    {
                        using (transaction)
                        {
                            string query = " Exec sp_CRE_ActivateCompany @companyID ";
                            int result = Convert.ToInt32(con.ExecuteScalar(query, new { CompanyID = companyID }, transaction: transaction));
                            if ( result != 0)
                            {
                                info.flag = 0;
                                info.message = "Company Activated";
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

        public (int flag, string message) RejectCompanyRegister(int companyID)
        {
            var info = (flag: 1, message: "Failed to Reject - Company ID not found");
            using (var con = CreateConnection())
            {
                if (con != null)
                {                   
                    using var transaction = con.BeginTransaction();
                    try
                    {
                        using (transaction)
                        {
                            string query = 
                                " UPDATE Companies" +
                                " SET ActiveStatus = 2 " +
                                " WHERE CompanyID = @companyID ";
                            int count = con.Execute(query, new { CompanyID = companyID }, transaction: transaction);
                            if (count == 1)
                            {
                                info.flag = 0;
                                info.message = "Company Rejected";
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

        public (List<CompanyDTO> list, int maxPage) GetDeactivatedCompanyList(int page = 1, int count = 10)
        {
            var result = (list: new List<CompanyDTO>(), maxPage: 0);
            using (var con = CreateConnection())
            {
                
                string queryField =
                    " SELECT FieldID, FieldName, CompanyID " +
                    " FROM CareerFields f JOIN CompanyFields cf ON f.Field_ID = cf.FieldID ;";
                string querySearch = 
                    " SELECT CompanyID, CompanyName, Address, WebSite, ImageURL, Phone, Email, Introduction " +
                    " FROM Companies c " +
                    " WHERE ActiveStatus = 0 ";
                using (var multiQ = con.QueryMultiple(queryField + querySearch))
                {
                    var fieldList = multiQ.Read<FieldDTO>();
                    var companyList = multiQ.Read<CompanyDTO>();
                    result.maxPage = (int)Math.Ceiling((float)companyList.Count() / count);
                    result.list = companyList.Skip(count * (page - 1)).Take(count).ToList();
                    foreach (var c in result.list)
                    {
                        c.CareerField = fieldList.Where(f => (f.CompanyID == c.CompanyID)).ToList();
                    }
                }
            }
            return result;
        }
        public (int flag, string message) RemoveCompany(int companyID)
        {
            var info = (flag: -1, message: "Remove Company Failed");
            using (var con = CreateConnection())
            {
                if (con != null)
                {
                    using var transaction = con.BeginTransaction();
                    try
                    {
                        using (transaction)
                        {
                            string query =
                                " EXEC sp_CRE_RemoveCompany @companyID, @defaultCompany ";
                            var param = new
                            {
                                CompanyID = companyID,
                                DefaultCompany = Startup.DefaultCompany
                            };
                            int count = Convert.ToInt32(con.ExecuteScalar(query, param, transaction: transaction));
                            info.flag = count;
                            switch(count)
                            {
                                case -1:
                                    info.message += " - Cannot remove default company ";
                                    break;
                                case -2:
                                    info.message += " - Cannot remove company after start OJT Term ";
                                    break;
                                case 0:
                                    info.message += $" - Company ID {companyID} not found ";
                                    break;
                                default:
                                    if (count > 0)
                                    {
                                        info.flag = 0;
                                        info.message = "Company Removed";
                                        transaction.Commit();
                                    }
                                    break;
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

        public (List<CompanyDTO> list, int maxPage) GetCompanyList(string search, int field, int page = 1, int count = 10)
        {
            var result = (list: new List<CompanyDTO>(), maxPage: 0);
            using (var con = CreateConnection())
            {
                
                string queryField =
                    " SELECT FieldID, FieldName, CompanyID " +
                    " FROM CareerFields f JOIN CompanyFields cf ON f.Field_ID = cf.FieldID ;";
                string querySearch =
                    " SELECT DISTINCT c.CompanyID, CompanyName, Address, ImageURL, Phone, Email, Introduction, WebSite, ApplyPosition, Description " +
                    " FROM Companies c JOIN CompanyFields cf ON c.CompanyID = cf.CompanyID " +
                    " WHERE (CompanyName LIKE @search OR ApplyPosition LIKE @search) AND FieldID LIKE @field AND ActiveStatus = 1 ";
                var param = new
                {
                    Search = $"%{search}%",
                    Field = (field == 0 ? "%%" : field + "")
                };
                using (var multiQ = con.QueryMultiple(queryField + querySearch, param))
                {
                    var fieldList = multiQ.Read<FieldDTO>();
                    var companyList = multiQ.Read<CompanyDTO>();
                    result.maxPage = (int)Math.Ceiling((float)companyList.Count() / count);
                    result.list = companyList.Skip(count * (page - 1)).Take(count).ToList();
                    foreach (var c in result.list)
                    {
                        c.CareerField = fieldList.Where(f => f.CompanyID == c.CompanyID).ToList();
                    }
                }
            }
            return result;
        }

        public CompanyDTO GetCompanyDetail(int companyID) 
        {
            CompanyDTO company = null;
            using (var con = CreateConnection())
            {
                
                string fieldQ =
                    " SELECT FieldID, FieldName, CompanyID " +
                    " FROM CareerFields f JOIN CompanyFields cf ON f.Field_ID = cf.FieldID " +
                    " WHERE CompanyID = @id ;";
                string query = 
                    " SELECT CompanyID, CompanyName, Address, Phone, Email, WebSite, Description, Introduction, ImageURL, ApplyPosition " +
                    " FROM Companies " +
                    " WHERE CompanyID = @id;";
                using (var multiQ = con.QueryMultiple(query + fieldQ, new { ID = companyID }))
                {
                    company = multiQ.Read<CompanyDTO>().FirstOrDefault();
                    company.CareerField = multiQ.Read<FieldDTO>().ToList();
                }
            }
            return company;
        }

        public (int flag, string message) UpdateCompanyInfo(CompanyDTO company)
        {
            var result = (flag: 1, message: "Failed To Update");
            using (var con = CreateConnection())
            {
                if (con != null)
                {
                    
                    using var transaction = con.BeginTransaction();
                    try
                    {
                        var param = new
                        {
                            Name = company.CompanyName,
                            Address = company.Address,
                            Phone = company.Phone,
                            Email = company.Email,
                            WebSite = company.WebSite,
                            Intro = company.Introduction,
                            Descript = company.Description,
                            ImageURL = company.ImageURL,
                            Position = company.ApplyPosition,
                            ID = company.CompanyID
                        };
                        string query =
                            " UPDATE Companies " +
                            " SET CompanyName = @name, Address = @address, Phone = @phone, Email = @email, WebSite = @webSite, Introduction = @intro, Description = @descript, ApplyPosition = @position ";
                        if (!string.IsNullOrEmpty(company.ImageURL))
                        {
                            query += ", ImageURL = @imageURL ";
                        }
                        query += " WHERE CompanyID = @id ";                        
                        bool valid = con.Execute(query, param, transaction: transaction) == 1;
                        if (valid)
                        {
                            transaction.Commit();
                            result.flag = 0;
                            result.message = "Updated";
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
        public (int flag, string message) UpdateCompanyFields(FieldDTO[] CareerField, int companyID)
        {
            var result = (flag: 1, message: "Failed To Update Field");
            using (var con = CreateConnection())
            {
                if (con != null)
                {
                    
                    using (var transaction = con.BeginTransaction())
                    {
                        try
                        {
                            string deleteFieldQ =
                                " DELETE FROM CompanyFields " +
                                " WHERE CompanyID = @companyID ";
                            string insertFieldQ =
                                " INSERT INTO CompanyFields (CompanyID, FieldID) " +
                                " VALUES (@companyID, @fieldID) ";
                            con.Execute(deleteFieldQ, new { CompanyID = companyID}, transaction:transaction);
                            foreach (var f in CareerField)
                            {
                                if (f != null)
                                {
                                    con.Execute(insertFieldQ, new { CompanyID = companyID, f.FieldID }, transaction: transaction);
                                }
                            }
                            transaction.Commit();
                            result = (flag: 0, message: "Fields Updated");
                        } 
                        catch
                        {
                            transaction.Rollback();
                        }
                    }
                }
            }
            return result;
        }

            public (int flag, string message) SetDefaultCompany(int companyID, int termNumber = 0)
        {
            var result = (flag: -1, message: "Only set default company when the deadline is due");
            using (var con = CreateConnection())
            {
                if (con != null)
                {
                    
                    using (var transaction = con.BeginTransaction())
                    {
                        try
                        {
                            string query = " EXEC sp_CRE_SetDefaultCompany @companyID, @termNumber ";
                            var param = new
                            {
                                CompanyID = companyID,
                                TermNumber = termNumber
                            };
                            var code = Convert.ToInt32(con.ExecuteScalar(query, param, transaction: transaction));
                            if (code < 0)
                            {
                                result.flag = -99;
                                result.message = $"Company ID: {companyID} Not found";
                            }
                            else if (code > 0)
                            {
                                result.message = $"Default company set: {companyID}";
                                result.flag = 0;
                                transaction.Commit();
                            }
                        }
                        catch (Exception)
                        {
                            transaction.Rollback();
                        }
                    }
                }
            }
            return result;
        }
    }
}
