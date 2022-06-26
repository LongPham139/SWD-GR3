using System.ComponentModel.DataAnnotations;
using System;
using SWP391Group6Project.Models.DTO;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace SWP391Group6Project.Models
{
    public class LoginModel
    {
        [Required]
        public string Username { get; set; }
        [Required]
        public string Password { get; set; }
    }

    public class ChangePasswordModel
    {
        [Required]
        [MaxLength(50), MinLength(6)]
        public string OldPassword { set; get; }
        [Required]
        [MaxLength(50), MinLength(6)]
        public string NewPassword { set; get; }
    }

    [Serializable]
    public class CRResgiterModel
    {
        [Required]
        [MaxLength(50), MinLength(2)]
        public string Username { set; get; }
        [Required]
        [MaxLength(50), MinLength(6)]
        public string Password { set; get; }
        [Required]
        [MaxLength(50), MinLength(2)]
        public string CompanyName { set; get; }
        [Required]
        [EmailAddress]
        [MaxLength(50)]
        public string Email { set; get; }
        [Required]
        [Phone]
        [MaxLength(20)]
        public string Phone { set; get; }
        [Required]
        [MaxLength(100)]
        public string Address { set; get; }
        [Required]
        [Url]
        [MaxLength(50)]
        public string WebSite { set; get; }
    }
    public class StudentRequestToCREModel
    {
        [Required]
        [Range(1, 3)]
        public int RequestType { get; set; }
        [Required]
        public int CompanyID { get; set; }
        [Required]
        public string Purpose { get; set; }
        [Required]
        public string RequestTitle { get; set; }
        public string StudentID { get; set; }
    }

    public class CompanyInputModel
    {
        [Required]
        [MaxLength(50), MinLength(3)]
        public string CompanyName { set; get; }
        [Required]
        [MaxLength(100)]
        public string Address { set; get; }
        [MaxLength(20)]
        public string Phone { set; get; }
        [Required]
        [MaxLength(50)]
        public string Email { set; get; }
        [MaxLength(50)]
        public string WebSite { set; get; }
        [MaxLength(2048)]
        public string Introduction { set; get; }
        [MaxLength(4096)]
        public string Description { set; get; }
        [MaxLength(4096)]
        public string ApplyPosition { set; get; }
        public IFormFile Image { set; get; }
    }
    public class StudentGradeResult {
        [Required]
        public string StudentID { set; get; }
        [Required]
        [Range(0, 100)]
        public int Attendance { set; get; }
        [Required]
        [Range(0, 100)]
        public int Attitude { set; get; }
        [Required]
        [Range(0, 100)]
        public int Progress { set; get; }
    }

    public class StudentProfileModel
    {
        [Required]
        [MaxLength(50), MinLength(3)]
        public string FullName { set; get; }
        [Required]
        public DateTime DateOfBirth { set; get; }
        [MaxLength(100)]
        public string Address { set; get; }
        [Phone]
        [MaxLength(20), MinLength(10)]
        public string Phone { set; get; }
        public IFormFile CV { set; get; }
    }

    public class TermCreateModel
    {
        [Required]
        [MaxLength(15), MinLength(3)]
        public string TermName { set; get; }
        [Required]
        public DateTime StartDate { set; get; }
        [Required]
        public DateTime EndDate { set; get; }
        [Required]
        public DateTime RequestDueDate { set; get; }
    }

    public class TermUpdateModel
    {
        [Required]
        [Range(0, int.MaxValue)]
        public int TermNumber { set; get; }
        [Required]
        [MaxLength(15), MinLength(3)]
        public string TermName { set; get; }
        [Required]
        public DateTime StartDate { set; get; }
        [Required]
        public DateTime EndDate { set; get; }
        [Required]
        public DateTime RequestDueDate { set; get; }
    }

    public class StudentModel
    {        
        [Required]
        [MaxLength(50), MinLength(3)]
        public string FullName { set; get; }
        [Required]
        [EmailAddress]
        [RegularExpression(@"^[a-z]{1}[a-z0-9]+[a-z]{2}[0-9]{6,8}@fpt.edu.vn$")]
        [MaxLength(50)]
        public string Email { set; get; }
        [Required]
        public DateTime DateOfBirth { set; get; }
        [Required]
        [MaxLength(6)]
        public string Gender { set; get; }       
        [MaxLength(100)]
        public string Address { set; get; }
        [Phone]
        [MaxLength(20), MinLength(10)]
        public string Phone { set; get; }
        [Required]
        [Range(1,255)]
        public int Major { set; get; }
    }

    public class StudentInsertModel : StudentModel
    {
        [Required]
        [RegularExpression(@"^[a-zA-Z]{2}[0-9]{6,8}$")]
        [MaxLength(10)]
        public string StudentID { set; get; }
    }
    public class StudentUpdateModel : StudentModel
    {
        [Required]
        [MaxLength(50)]
        public string Username { set; get; }
        [Required]
        public bool AccountStatus { set; get; }
    }
}