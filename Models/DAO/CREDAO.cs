using SWP391Group6Project.Models.DTO;
using System;

namespace SWP391Group6Project.Models.DAO
{
    public class CREDAO : DAO
    {
        private static CREDAO instance;
        private static object instanceLock = new object();
        public static CREDAO Instance
        {
            get
            {
                lock (instanceLock)
                {
                    return instance == null ? instance = new CREDAO() : instance;
                }
            }
        }
        private CREDAO() : base() { }
    }
}
