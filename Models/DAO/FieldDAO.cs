using SWP391Group6Project.Models.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using Dapper;

namespace SWP391Group6Project.Models.DAO
{
    public class FieldDAO : DAO
    {
        private static FieldDAO instance;
        private static object instanceLock = new object();
        public static FieldDAO Instance
        {
            get
            {
                lock (instanceLock)
                {
                    return instance == null ? instance = new FieldDAO() : instance;
                }
            }
        }
        public FieldDAO() : base() { }

        public List<FieldDTO> GetFields()
        {
            List<FieldDTO> list = null;
            using (var con = CreateConnection())
            {
                string search = " SELECT Field_ID as 'FieldID', FieldName " +
                    " FROM CareerFields ";
                list = con.Query<FieldDTO>(search).ToList();
            }
            return list;
        }
    }
}
