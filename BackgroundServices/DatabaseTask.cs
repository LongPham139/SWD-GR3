using SWP391Group6Project.Models.DAO;
using SWP391Group6Project.Models.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SWP391Group6Project.BackgroundServices
{
    public class DatabaseTask
    {
        private static readonly DatabaseTask instance;
        public static DatabaseTask Instance => instance;

        static DatabaseTask()
        {
            instance = new DatabaseTask();
        }
        private DatabaseTask() { }
        public async Task SetDefaultCompany(int companyID)
        {
            bool isUpdated = false;
            TimeSpan zeroSpan = default(TimeSpan);
            TimeSpan daySpan = new TimeSpan(23, 59, 59);
            TimeSpan timeToTomorrow;
            TermDTO term;
            TermDAO termDAO = TermDAO.Instance;
            CompanyDAO companyDAO = CompanyDAO.Instance;
            while (true)
            {
                term = termDAO.GetCurrentTerm();
                TimeSpan timeDifference = term.RequestDueDate.Subtract(DateTime.Now);
                if (timeDifference >= zeroSpan)
                {
                    isUpdated = false;
                    if (timeDifference > daySpan)
                    {
                        await Task.Delay(daySpan);
                    }
                    else
                    {
                        //In-time
                        await Task.Delay(timeDifference);
                        await RestAfterCompleted();
                    }
                }
                else
                {
                    if (isUpdated)
                    {
                        await Task.Delay(daySpan);
                    }
                    else
                    {
                        //Overtime
                        await RestAfterCompleted();
                    }
                }
            }
            async Task RestAfterCompleted()
            {
                companyDAO.SetDefaultCompany(companyID, term.TermNumber);
                isUpdated = true;
                timeToTomorrow = DateTime.Now.Date.AddDays(1).Subtract(DateTime.Now);
                await Task.Delay(timeToTomorrow);
            }
        }

        public async void CheckRequestDueDate(int companyID)
        {
            await SetDefaultCompany(companyID);
        }
    }
}
