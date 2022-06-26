

using System.Collections.Generic;

namespace SWP391Group6Project.Models.DTO
{
    public class CompanyDTO
    {
        public int CompanyID { set; get; } = 0;
        public string CompanyName { set; get; }
        public string Address { set; get; }
        public string Phone { set; get; }
        public string Email { set; get; }
        public string WebSite { set; get; }    
        public List<FieldDTO> CareerField { set; get; }
        public string Introduction { set; get; }
        public string Description { set; get; }
        public string ImageURL { set; get; }
        public int ActiveStatus { set; get; }
        public string ApplyPosition { set; get; }
    }
}
