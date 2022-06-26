using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SWP391Group6Project.Models.DTO
{
    public class RequestDTO
    {
        public int RequestID { set; get; }
        public int RequestType { set; get; }
        public string TypeName { set; get; }
        public string RequestTitle { set; get; }
        public string StudentID { set; get; }
        public string FullName { set; get; }
        public string CompanyID { set; get; }
        public string CompanyName { set; get; }
        public int CRE_ID { set; get; }
        public DateTime CreateDate { set; get; }
        public DateTime? ChangeDate { set; get; }
        public string Purpose { set; get; }
        public string ProcessNote { set; get; }
        public int RequestStatus { set; get; }
        public string StatusName { set; get; }
    }
}
