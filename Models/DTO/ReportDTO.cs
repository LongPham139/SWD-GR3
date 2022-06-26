using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SWP391Group6Project.Models.DTO
{
    public class ReportDTO
    {
        public int TermNumber { set; get; }
        public string TermName { set; get; }
        public string StudentID { set; get; }
        public string FullName { set; get; }
        public int CompanyID { set; get; }
        public string CompanyName { set; get; }
        public int CR_ID { set; get; }
        public int? Attendance { set; get; }
        public int? Attitude { set; get; }
        public int? Grade { set; get; }
        public int? Average { set; get; }
        public string Evaluate { set; get; }
    }
}