using Dapper;
using Microsoft.Data.SqlClient;
using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace SWP391Group6Project.Models.DAO
{
    public class DAO
    {
        public DAO() 
        {
        }
        protected SqlConnection CreateConnection()
        {
            var connection = new SqlConnection(Startup.ConnectionString);
            connection.Open();
            return connection;
        }
        protected internal string HashPassword(string password)
        {
            using (SHA1 shaHash = SHA1.Create())
            {
                byte[] hashBytes = shaHash.ComputeHash(Encoding.UTF8.GetBytes(password));
                return BitConverter.ToString(hashBytes).Replace("-", "");
            }
        }
    }
}
