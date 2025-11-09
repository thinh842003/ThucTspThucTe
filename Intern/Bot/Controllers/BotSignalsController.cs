using Bot.Data;
using Bot.Request;
using Bot.Services.MiniServiceBotSignal;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Text.Json;

namespace Bot.Controllers
{
    [Route("api/signal")]
    [ApiController]
    public class BotSignalsController : ControllerBase
    {
        private readonly IBotSignalService _botSignalService;
        private readonly IHubContext<MessageHub> _hubContext;
        private readonly IConfiguration _configuration;

        // 🧠 Lưu lại tín hiệu cuối cùng để tránh gửi trùng
        private static string? _lastSignal = null;
        private static DateTime _lastSignalTime = DateTime.MinValue;

        public BotSignalsController(
            IBotSignalService botSignalService,
            IHubContext<MessageHub> hubContext,
            IConfiguration configuration)
        {
            _botSignalService = botSignalService;
            _hubContext = hubContext;
            _configuration = configuration;
        }

        private async Task SendToDiscord(string text)
        {
            using var client = new HttpClient();
            var webhookUrl = _configuration["DiscordWebhookUrl"];
            var json = JsonSerializer.Serialize(new { content = text });

            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
            var response = await client.PostAsync(webhookUrl, content);
            var respText = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"Discord status: {response.StatusCode} - {respText}");
        }

        [HttpGet]
        public async Task<IActionResult> GetSignals()
        {
            return Ok(await _botSignalService.GetSignals());
        }

        [HttpPost("sendMessage")]
        public async Task<IActionResult> SendMessage([FromForm] SendMessageRequest request)
        {
            try
            {
                Console.WriteLine($"Received POST /api/signal/sendMessage\n {JsonSerializer.Serialize(request)}");

                if (request.Key != _configuration["MessageToken"])
                    return BadRequest();

                // Phân tích tín hiệu từ message
                var message = request.Text.Split('\n');
                var signal = message[1].Trim().ToUpper().Contains("LONG") ? "LONG" : "SHORT";
                // ⛔ Kiểm tra tín hiệu trùng
                if (_lastSignal == signal)
                {
                    Console.WriteLine($"⏸ Bỏ qua tín hiệu trùng: {_lastSignal} (thời gian: {_lastSignalTime})");
                    return Ok(new { status = "ignored", reason = "duplicate_signal" });
                }

                // ✅ Cập nhật tín hiệu cuối cùng
                _lastSignal = signal;
                _lastSignalTime = DateTime.Now;

                // Gửi tín hiệu hợp lệ
                var messageResponse = _botSignalService.CacheSignal(signal, request.Text);
await _hubContext.Clients.All.SendAsync("Signal", messageResponse);
                await _botSignalService.AddSignal(request.Text);
                await SendToDiscord(request.Text);

                Console.WriteLine($"✅ Gửi tín hiệu mới: {signal}");
                return Ok(new { status = "sent", signal });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Lỗi: {ex.Message}");
                return BadRequest(ex.Message);
            }
        }
    }
}