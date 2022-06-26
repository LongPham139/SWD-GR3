using System;

namespace SWP391Group6Project.Models.DTO
{
    public class StudentDTO : UserDTO
    {
        public string StudentID { set; get; }
        public DateTime DateOfBirth { set; get; }
        public string Gender { set; get; }
        public string Address { set; get; }
        public string Phone { set; get; }
        public int Major { set; get; }
        public string FieldName { set; get; }
        public string CV_URL { set; get; }
        public bool OJTStatus { set; get; }
    }
}