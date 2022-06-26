using System;
using System.Collections.Generic;
using System.Linq;
using Dapper;
using SWP391Group6Project.Models.DTO;

namespace SWP391Group6Project.Models.DAO
{
    public class TermDAO : DAO
    {
        private static TermDAO instance;
        private static object instanceLock = new object();
        public static TermDAO Instance
        {
            get
            {
                lock (instanceLock)
                {
                    return instance == null ? instance = new TermDAO() : instance;
                }
            }
        }
        private TermDAO() : base() { }
        public (int flag, string message) CreateNewTerm(TermCreateModel term)
        {
            var info = (flag: 1, message: "Dupplicate TermName");
            using (var con = CreateConnection())
            {
                if (con != null)
                {
                    using var transaction = con.BeginTransaction();
                    try
                    {
                        string query = " INSERT INTO Terms (TermName, StartDate, EndDate, TermStatus, RequestDueDate) " +
                                       " VALUES (@termName, @start, @end, 1, @due) ";
                        var param = new
                        {
                            TermName = term.TermName,
                            Start = term.StartDate,
                            End = term.EndDate,
                            Due = term.RequestDueDate
                        };
                        if (con.Execute(query, param, transaction: transaction) == 1)
                        {
                            info.flag = 0;
                            info.message = $"New term {term.TermName} Created";
                            transaction.Commit();
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

        public (int flag, string message) UpdateTerm(TermUpdateModel term)
        {
            var info = (flag: 1, message: "Update Failed");
            using (var con = CreateConnection())
            {
                if (con != null)
                {
                    using var transaction = con.BeginTransaction();
                    try
                    {
                        string query =
                            " UPDATE Terms " +
                            " SET TermName = @termName, StartDate = @start, EndDate = @end, RequestDueDate = @due " +
                            " WHERE TermNumber = @termNumber";
                        var param = new
                        {
                            TermNumber = term.TermNumber,
                            TermName = term.TermName,
                            Start = term.StartDate,
                            End = term.EndDate,
                            Due = term.RequestDueDate
                        };
                        if (con.Execute(query, param, transaction: transaction) == 1)
                        {
                            info.flag = 0;
                            info.message = "Updated";
                            transaction.Commit();
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
        public TermDTO GetCurrentTerm()
        {
            TermDTO term = null;
            using (var con = CreateConnection())
            {
                string query = $" SELECT TOP 1 TermNumber, TermName, StartDate, EndDate, TermStatus, RequestDueDate " +
                    " FROM Terms " +
                    " WHERE CONVERT(date, GETDATE()) BETWEEN StartDate AND EndDate ";
                term = con.Query<TermDTO>(query).FirstOrDefault();
            }
            return term;
        }

        public TermDTO GetLastestAddedTerm()
        {
            TermDTO term = null;
            using (var con = CreateConnection())
            {
                string query =
                    " SELECT TOP 1 TermNumber, TermName, StartDate, EndDate, TermStatus, RequestDueDate " +
                    " FROM Terms " +
                    " ORDER BY EndDate DESC ";
                term = con.Query<TermDTO>(query).FirstOrDefault();
            }
            return term;
        }
        public TermDTO GetMaxEndAddedTerm()
        {
            TermDTO term = null;
            using (var con = CreateConnection())
            {
                string query = "select top(1) * from Terms order by EndDate DESC";
                term = con.Query<TermDTO>(query).FirstOrDefault();
            }
            return term;
        }
        public TermDTO GetPreviousTerm(int TermNumber)
        {
            TermDTO term = null;
            using (var con = CreateConnection())
            {
                string query = "SELECT top(1) * from Terms where TermNumber < @TermNumber";
                term = con.Query<TermDTO>(query, new {TermNumber = TermNumber}).FirstOrDefault();
            }
            return term;
        }
        public TermDTO GetTermInfo(int termNumber)
        {
            TermDTO term = null;
            using (var con = CreateConnection())
            {
                string query = $" SELECT TOP 1 TermNumber, TermName, StartDate, EndDate, TermStatus, RequestDueDate " +
                    " FROM Terms " +
                    " WHERE TermNumber = @termNumber ";
                term = con.Query<TermDTO>(query, new { TermNumber = termNumber }).FirstOrDefault();
            }
            return term;
        }

        public (List<TermDTO> list, int maxPage) GetTermList(int page = 1, int count = 10)
        {
            var result = (list: new List<TermDTO>(), maxPage: 0);
            int pos = 1 + (page - 1) * count;
            using (var con = CreateConnection())
            {
                string countQ = " SELECT COUNT(*) FROM Terms ; ";
                string query =
                    $" SELECT TOP {count} TermNumber, TermName, StartDate, EndDate, TermStatus, RequestDueDate " +
                    " FROM (SELECT ROW_NUMBER() OVER (ORDER BY TermNumber) as 'No', TermNumber, TermName, StartDate, EndDate, TermStatus, RequestDueDate " +
                           "FROM Terms) termList " +
                    " WHERE termList.No >= @start ";
                using (var multiQ = con.QueryMultiple(countQ + query, new { Start = pos }))
                {
                    result.maxPage = (int)Math.Ceiling(multiQ.Read<double>().FirstOrDefault() / count);
                    result.list = multiQ.Read<TermDTO>().ToList();
                }
            }
            return result;
        }
    }
}
