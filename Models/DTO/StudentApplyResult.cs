using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SWP391Group6Project.Models.DTO
{
    public class StudentApplyResult
    {
        public string StudentID { set; get; }
        public string FullName { set; get; }
        public string Email { set; get; }
        public int TermNumber { set; get; }
        public string TermName { set; get; }
        public string CompanyName { set; get; }
        public string StatusName { set; get; }
    }
}
