using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SWP391Group6Project.Models.DTO
{
    public class TermDTO
    {
        public int TermNumber { set; get; } = 0;
        public string TermName { set; get; }
        public DateTime StartDate { set; get; }
        public DateTime EndDate { set; get; }
        public bool TermStatus { set; get; }
        public DateTime RequestDueDate { set; get; }
    }
}
