// using Bot.DbContext;
// using Bot.Models;
// using Bot.Response;
// using Bot.Services.MiniServiceCaching;
// using Microsoft.EntityFrameworkCore;
// using System.Globalization;

// namespace Bot.Services.MiniServiceBotSignal
// {
//     public class BotSignalService : IBotSignalService
//     {
//         private readonly MyDbContext _dbContext;
//         private readonly ICachingService _cachingService;
//         public BotSignalService(MyDbContext dbContext, ICachingService cachingService)
//         {
//             _dbContext = dbContext;
//             _cachingService = cachingService;
//         }

//         public async Task AddSignal(string text)
//         {
//             var message = text.Split('\n');
//             var datetime = message[0].Trim().Split(" ")[2] + " " + message[0].Trim().Split(" ")[3];
//             var tinhieu = message[1].Trim() == "Tin hieu long: Manh" ? "LONG" : "SHORT";
//             var gia = message[2].Trim().Split(":")[1].Trim();

//             string inputFormat = "yyyy-MM-dd HH:mm:ss";

//             var signal = new BotSignal
//             {
//                 Signal = tinhieu,
//                 Price = double.Parse(gia),
//                 DateTime = DateTime.ParseExact(datetime, inputFormat, CultureInfo.InvariantCulture)
//             };
//             await _dbContext.AddAsync(signal);
//             await _dbContext.SaveChangesAsync();
//         }

//         public async Task<IList<SignalResponse>> GetSignals()
//         {
//             return await _dbContext.BotSignals
//                 .OrderByDescending(e => e.DateTime)
//                 .Take(10)
//                 .Select(e => new SignalResponse
//                 {
//                     Price = e.Price,
//                     Signal = e.Signal,
//                     DateTime = e.DateTime.ToString("dd/MM/yyyy HH:mm:ss"),
//                 }).ToListAsync();
//         }
//         public string CacheSignal(string signal, string message)
//         {
//             var now = TimeOnly.FromDateTime(DateTime.Now);
//             var noon = new TimeOnly(12, 00);

//             if (now < noon)
//             {
//                 if (_cachingService.Get<string>("Morning") != null
//                     && _cachingService.Get<string>("Morning") != signal)
//                 {
//                     message += "\nREVERSE";
//                 }
//                 _cachingService.Set("Morning", signal, TimeSpan.FromHours(3));
//             }
//             else
//             {
//                 if (_cachingService.Get<string>("Afternoon") != null
//                     && _cachingService.Get<string>("Afternoon") != signal)
//                 {
//                     message += "\nREVERSE";
//                 }
//                 _cachingService.Set("Afternoon", signal, TimeSpan.FromHours(3));
//             }

//             return message;
//         }

//     }
// }


using Bot.DbContext;
using Bot.Models;
using Bot.Response;
using Bot.Services.MiniServiceCaching;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace Bot.Services.MiniServiceBotSignal
{
    public class BotSignalService : IBotSignalService
    {
        private readonly MyDbContext _dbContext;
        private readonly ICachingService _cachingService;
        public BotSignalService(MyDbContext dbContext, ICachingService cachingService)
        {
            _dbContext = dbContext;
            _cachingService = cachingService;
        }

        public async Task AddSignal(string text)
        {
            Console.WriteLine($"Received AddSignal:::{text}");
            // 07/10/2025 16:12:56\nTin hieu long: Manh\nGia: 1460.90

            var message = text.Split('\n');
            var datetime = message[0].Trim();//.Split(" ")[0] + " " + message[0].Trim().Split(" ")[1];
            var tinhieu = message[1].Trim().ToUpper() == "TIN HIEU: LONG" ? "LONG" : "SHORT";
            var gia = message[2].Trim().Split(":")[1].Trim();

            string inputFormat = "dd/MM/yyyy HH:mm:ss";

            var signal = new BotSignal
            {
                Signal = tinhieu,
                Price = double.Parse(gia),
                DateTime = DateTime.ParseExact(datetime, inputFormat, CultureInfo.InvariantCulture)
            };
            
            await _dbContext.AddAsync(signal);
            await _dbContext.SaveChangesAsync();
        }

        public async Task<IList<SignalResponse>> GetSignals()
        {
            return await _dbContext.BotSignals
                .OrderByDescending(e => e.DateTime)
                .Take(10)
                .Select(e => new SignalResponse
                {
                    Price = e.Price,
                    Signal = e.Signal,
                    DateTime = e.DateTime.ToString("dd/MM/yyyy HH:mm:ss"),
                }).ToListAsync();
        }
        public string CacheSignal(string signal, string message)
        {
            var now = TimeOnly.FromDateTime(DateTime.Now);
            var noon = new TimeOnly(12, 00);

            if (now < noon)
            {
                if (_cachingService.Get<string>("Morning") != null
                    && _cachingService.Get<string>("Morning") != signal)
                {
                    message += "\nREVERSE";
                }
                _cachingService.Set("Morning", signal, TimeSpan.FromHours(3));
            }
            else
            {
                if (_cachingService.Get<string>("Afternoon") != null
                    && _cachingService.Get<string>("Afternoon") != signal)
                {
                    message += "\nREVERSE";
                }
                _cachingService.Set("Afternoon", signal, TimeSpan.FromHours(3));
            }

            return message;
        }

    }
}