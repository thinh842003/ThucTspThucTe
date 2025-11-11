using Bot.Data;
using Bot.Request;
using Bot.Services.MiniServiceBotSignal;
using Bot.Services.MiniServiceCaching;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Globalization;

namespace Bot.Controllers
{
    [Route("api/admin")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminsController : ControllerBase
    {
        private readonly IHubContext<MessageHub> _hubContext;
        private readonly IBotSignalService _botSignalService;
        private readonly ICachingService _cachingService;

        private readonly CultureInfo culture;
        public AdminsController(IHubContext<MessageHub> hubContext, IBotSignalService botSignalService, ICachingService cachingService)
        {
            _hubContext = hubContext;
            _botSignalService = botSignalService;
            _cachingService = cachingService;

            culture = new CultureInfo("en-US");
            culture.NumberFormat.NumberDecimalSeparator = ".";
        }

        private string RoundAndCultureUS(double value) => Math.Round(value, 1).ToString(culture);

        [HttpPost("signal/add")]
        public async Task<IActionResult> AddSignal([FromBody] AdminSignalRequest request)
        {
            var dateTime = DateTime.Now;
            var DateTimeFormat = dateTime.ToString("yyyy-MM-dd HH:mm:ss");
            var signal = request.Status.ToUpper();

            var message = "";
            var messageResponse = "";

            if (request.Status == "CANCEL_ALL" || request.Status == "CANCEL_VITHE")
            {
                messageResponse = request.Status;
            }
            else if(request.Price == 0 && request.StopOrderValue != 0 && request.OrderNumber != 0)
            {
                messageResponse = "STOP_ORDER_ONLY\n" 
                    + request.Status + "\n" 
                    + request.OrderNumber + "\n"
                    + request.StopOrderValue;
            }
            else
            {
                if (request.Status == "SHORT")
                {
                    var catLo = RoundAndCultureUS(request.Price * 1.003);

                    if (request.StopOrderValue != 0)
                    {
                        catLo = RoundAndCultureUS(request.StopOrderValue);
                    }

                    message = $"#VN30 Ngay {DateTimeFormat} bot server\n"
                        + $"Tin hieu {signal.ToLower()}: Manh\n"
                        + $"Gia mua: {RoundAndCultureUS(request.Price)}\n"
                        + $"Target 1: {RoundAndCultureUS(request.Price * 0.997)}\n"
                        + $"Target 2: {RoundAndCultureUS(request.Price * 0.994)}\n"
                        + $"Target 3: {RoundAndCultureUS(request.Price * 0.989)}\n"
                        + $"Target 4: {RoundAndCultureUS(request.Price * 0.984)}\n"
                        + $"Cat lo: {catLo}";
                }
                else
                {
                    var catLo = RoundAndCultureUS(request.Price * 0.997);

                    if (request.StopOrderValue != 0)
                    {
                        catLo = RoundAndCultureUS(request.StopOrderValue);
                    }

                    message = $"#VN30 Ngay {DateTimeFormat} bot server\n"
                        + $"Tin hieu {signal.ToLower()}: Manh\n"
                        + $"Gia mua: {RoundAndCultureUS(request.Price)}\n"
                        + $"Target 1: {RoundAndCultureUS(request.Price * 1.003)}\n"
                        + $"Target 2: {RoundAndCultureUS(request.Price * 1.006)}\n"
                        + $"Target 3: {RoundAndCultureUS(request.Price * 1.01)}\n"
                        + $"Target 4: {RoundAndCultureUS(request.Price * 1.016)}\n"
                        + $"Cat lo: {catLo}";
                }

                messageResponse = _botSignalService.CacheSignal(signal, message);

                if (!message.Equals(messageResponse))
                {
                    messageResponse += request.StopOrderValue == 0
                        ? " NO_STOP_ORDER"
                        : " STOP_ORDER";
                }
                else
                {
                    messageResponse += request.StopOrderValue == 0
                        ? "\nNO_STOP_ORDER"
                        : "\nSTOP_ORDER";
                }

                if (request.OrderNumber != 0)
                {
                    messageResponse += " " + request.OrderNumber;
                }

                await _botSignalService.AddSignal(message);
                messageResponse = messageResponse.Replace(DateTimeFormat, dateTime.ToString("dd/MM/yyyy HH:mm:ss"));
            }

            await _hubContext.Clients.All.SendAsync("AdminSignal", messageResponse);

            return Ok();
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            try
            {
                if (Path.GetExtension(file.FileName) != ".js")
                {
                    throw new Exception("File js only");
                }

                var path = Path.Combine(Directory.GetCurrentDirectory(), "Response", "script.js");
                using (var stream = new FileStream(path, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }

        }

        [HttpPost("upload-ext")]
        public async Task<IActionResult> UploadExt(IFormFile file)
        {
            try
            {
                if (Path.GetExtension(file.FileName) != ".rar")
                {
                    throw new Exception("File rar only");
                }

                var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "ext.rar");
                using (var stream = new FileStream(path, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }

        }

        [HttpPost("upload-script1")]
        public async Task<IActionResult> UploadScript1(IFormFile file)
        {
            try
            {
                if (Path.GetExtension(file.FileName) != ".js")
                {
                    throw new Exception("File js only");
                }

                var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "script1.js");
                using (var stream = new FileStream(path, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        [HttpPost("upload-ext-entrade")]
        public async Task<IActionResult> UploadExtEntrade(IFormFile file)
        {
            try
            {
                if (Path.GetExtension(file.FileName) != ".rar")
                {
                    throw new Exception("File rar only");
                }

                var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "ext_entrade.rar");
                using (var stream = new FileStream(path, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

    }
}
