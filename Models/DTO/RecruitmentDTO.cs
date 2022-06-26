using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SWP391Group6Project.Models.DTO
{
    public class RecruitmentDTO
    {
        public string StudentID { set; get; }
        public string FullName { set; get; }
        public int TermNumber { set; get; }
        public int CompanyID { set; get; }
        public string CompanyName { set; get; }
        public int RecruitmentStatus { set; get; }
        public string StatusName { set; get; }
    }
}
