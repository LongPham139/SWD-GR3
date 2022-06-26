using Microsoft.Extensions.Configuration;
using SWP391Group6Project.Models.DTO;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
namespace SWP391Group6Project.BackgroundServices
{
    public class EmailSender
    {
        private static string senderEmail;
        private static string senderPassword;
        static EmailSender()
        {
            var builder = new ConfigurationBuilder().SetBasePath(Directory.GetCurrentDirectory())
                                                .AddJsonFile("appsettings.json", true, true)
                                                .Build();
            senderEmail = builder["SMTPService:Email"];
            senderPassword = builder["SMTPService:Password"];
        }
        private static void SendEmail(string toEmail, string subject, string content)
        {
            try
            {
                MailMessage message = new MailMessage();
                SmtpClient smtp = new SmtpClient();
                message.From = new MailAddress(senderEmail, "OJT Management System");
                message.To.Add(new MailAddress(toEmail));
                message.Subject = subject;
                message.Body = content;
                smtp.Port = 587;
                smtp.Host = "smtp.gmail.com";
                smtp.EnableSsl = true;
                smtp.UseDefaultCredentials = false;
                smtp.Credentials = new NetworkCredential(senderEmail, senderPassword);
                smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
                smtp.SendMailAsync(message);
            }
            catch { }
        }
        public static void SendHtmlEmail(string toEmail, string subject, string content)
        {
            try
            {
                MailMessage message = new MailMessage();
                SmtpClient smtp = new SmtpClient();
                message.From = new MailAddress(senderEmail, "OJT Management System");
                message.To.Add(new MailAddress(toEmail));
                message.IsBodyHtml = true;
                message.Subject = subject;
                message.Body = content;
                smtp.Port = 587;
                smtp.Host = "smtp.gmail.com";
                smtp.EnableSsl = true;
                smtp.UseDefaultCredentials = false;
                smtp.Credentials = new NetworkCredential(senderEmail, senderPassword);
                smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
                smtp.SendMailAsync(message);
            }
            catch { }
        }
    }
}
