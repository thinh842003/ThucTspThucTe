function debounce(func, delay) {
  let timeout;

  return function executedFunc(...args) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, delay);
  };
}
function setCookie(cname, cvalue, exMinutes) {
  const d = new Date();
  d.setTime(d.getTime() + (exMinutes * 60 * 1000));
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}

const packageHtml = `
    <div id='sat-content' style="width:50%;max-width:none;margin:0 auto;">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-table@1.22.6/dist/bootstrap-table.min.css">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
            .modal-backdrop {
                z-index: -1;
            }

         .bot-section .row,
         .bot-section .col {
             margin: 0;
             padding: 0;
         }

         .text-long,
         .text-buy {
             color: #3a9d5d;
         }

         .btn-long,
         td.long,
         td.buy {
             background: #3a9d5d;
         }

         .text-short {
             color: #f63c3a;
         }

         .btn-short,
         td.short {
             background: #f63c3a;
         }

         td.sell,
         td.cover {
             background: #e1c608;
         }

         #tbl-bot-signals td.long,
         #tbl-bot-signals td.buy,
         #tbl-bot-signals td.short,
         #tbl-bot-signals td.sell,
         #tbl-bot-signals td.cover {
             font-weight: bold !important;
             color: white !important;
         }

         #tbl-bot-signals span.time {
             font-size: 0.9rem;
         }

         #tbl-bot-signals span.price {
             font-weight: 600;
         }

         #ulPanel a.nav-link {
             white-space: nowrap;
             overflow: hidden;
             text-overflow: ellipsis;
         }

         label.form-label {
             font-size: 0.75rem;
             margin-bottom: 0;
             margin-top: 0.5rem;
         }
     </style>
     <style>
        td.bot-img,
        td.bot-img img {
            width: 80px;
        }

        td.bot-item {
            vertical-align: top !important;
        }

        div.updated {
            font-size: 0.75rem;
            font-style: italic;
            color: var(--gray-400);
            display: flex;
            align-items: end;
        }

        div.search.btn-group {
            width: 100%;
        }

        .modal-title {
            color: black;
        }

        .modal .close {
            font-size: 2rem !important;
        }

        #bot-select .tab-content {
            background-color: transparent;
            height: auto;
        }

        #bot-select .nav-item {
            padding: 0;
            font-size: 1rem;
            text-transform: uppercase;
        }

        .bot-item {
            color: black;
            padding: 4px 0 4px 0 !important;
        }

        .bot-item .text-info {
            color: #262cef !important;
        }

        .bot-item .text-warning {
            color: #d9be00 !important;
        }

        .bot-item .text-danger {
            color: #b00006 !important;
        }

        .star-yellow {
            color: #ffc107 !important;
        }

        .bot-item img.thumb {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            border: 0px;
            box-shadow: 0 0 5px 5px #e7e7e7;
        }

        .bot-item .title {
            font-weight: bold;
            font-size: 1rem;
        }

        .bot-item .subtitle {
            display: flex;
            flex-wrap: nowrap;
            align-items: baseline;
        }

        .bot-item .subtitle .small {
            font-size: 90%;
        }

        .bot-item .result {
            padding-top: 0.25rem;
            padding-bottom: 0.25rem;
            display: flex;
            justify-content: center;
            font-size: 0.95rem;
        }

        .bot-item .result span {
            font-weight: bold;
        }

        .bot-item .description {
            color: #333;
            text-align: justify;
            font-size: 0.9rem;
        }

        .bot-item .price {
            font-size: 1rem;
        }

        .bot-item .link {
            font-size: 0.9rem;
        }

        .bot-activate-message,
        .bot-extend-message {
            text-align: center;
            font-size: 1rem;
        }

        #bot-select div.fixed-table-container {
            max-height: 50vh !important;
        }
    </style>
    </div>
`

const loginFormHtml = `
<style>
  /* Container form */
  #ext-content {
    max-width: 360px;
    margin: 20px auto;
    padding: 20px;
    background-color: #f7f7f7;
    border-radius: 8px;
    box-shadow: 0 3px 10px rgba(0,0,0,0.15);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  /* Title / Status */
  #cb_loginStatus {
    text-align: center;
    margin-bottom: 15px;
    padding: 10px;
    background-color: #e7f3fe;
    color: #31708f;
    border-radius: 4px;
    font-size: 14px;
  }

  /* Form group */
  .form-group {
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
  }

  .form-group label {
    margin-bottom: 4px;
    font-weight: 600;
    font-size: 14px;
    color: #333;
  }

  .form-group input[type="text"],
  .form-group input[type="password"] {
    padding: 8px 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    transition: border 0.2s;
  }

  .form-group input[type="text"]:focus,
  .form-group input[type="password"]:focus {
    border-color: #66afe9;
    outline: none;
  }

  /* Show password checkbox */
  .form-group .checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
  }

  /* Login button */
  #cb_login {
    padding: 10px 0;
    background-color: #007bff;
    color: #fff;
    font-weight: 600;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
  }

  #cb_login:hover {
    background-color: #0056b3;
  }

  /* Links */
  .form-group a {
    font-size: 13px;
    color: #007bff;
    text-decoration: none;
    margin-top: 4px;
    display: inline-block;
  }

  .form-group a:hover {
    text-decoration: underline;
  }

  /* Responsive */
  @media (max-width: 400px) {
    #ext-content {
      margin: 10px;
      padding: 15px;
    }
  }
</style>

<div id="ext-content">
  <div id="bot-account-link">
    <div id="cb_loginStatus">
      Đăng nhập để liên kết với Tài khoản với chúng tôi
    </div>

    <div class="form-group">
      <label for="cb_username">Tên đăng nhập</label>
      <input id="cb_username" type="text" placeholder="Nhập tên đăng nhập">
    </div>

    <div class="form-group">
      <label for="cb_password">Mật khẩu</label>
      <input id="cb_password" type="password" placeholder="Nhập mật khẩu">
    </div>

    <div class="form-group checkbox-wrapper">
      <input id="cb_showPassword" type="checkbox">
      <label for="cb_showPassword">Hiện mật khẩu</label>
    </div>

    <div class="form-group">
      <button id="cb_login" type="button">Đăng nhập</button>
    </div>

    <div class="form-group">
      <a href="https://autobotps.com/register" target="_blank">Chưa có tài khoản? Đăng ký tại đây</a>
    </div>

    <div class="form-group">
      <a href="https://autobotps.com/forgetPass" target="_blank">Quên mật khẩu?</a>
    </div>
  </div>
</div>
`

const loggingHtml = `
         <style>
  /* Container chính */
  #bot-container {
    max-width: 480px;
    margin: 10px auto;
    padding: 10px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  /* Header link và logout */
  .bot-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 6px;
    border-bottom: 1px solid #ccc;
    margin-bottom: 10px;
  }

  .bot-header a {
    color: #007bff;
    text-decoration: none;
    font-size: 0.9rem;
  }

  .bot-header a:hover {
    text-decoration: underline;
  }

  /* Bot expired alert */
  .bot-expired {
    display: none;
    padding: 10px;
    margin-bottom: 10px;
    background-color: #f8d7da;
    color: #721c24;
    border-radius: 4px;
    text-align: center;
    font-size: 0.85rem;
  }

  .bot-expired a {
    display: inline-block;
    margin-top: 5px;
    padding: 6px 12px;
    background-color: #007bff;
    color: #fff;
    text-decoration: none;
    border-radius: 4px;
    font-size: 0.85rem;
  }

  .bot-expired a:hover {
    background-color: #0056b3;
  }

  /* Nhật ký hệ thống header */
  .bot-logs-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 6px;
    border-bottom: 1px solid #ccc;
    margin-bottom: 5px;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .bot-logs-header a {
    color: #dc3545;
    text-decoration: none;
    font-size: 0.85rem;
  }

  .bot-logs-header a:hover {
    text-decoration: underline;
  }

  /* Textarea logs */
  #bot-logs {
    width: 100%;
    height: 180px;
    padding: 8px;
    font-size: 0.75rem;
    font-style: italic;
    border: 1px solid #c8ced3;
    border-radius: 4px;
    background-color: #fff;
    color: #555;
    resize: none;
  }
</style>

<div id="bot-container">
  <!-- Header link và logout -->
  <div class="bot-header">
    <div>
      <i class="fa fa-copy"></i>
      <a href="https://autobotps.com" target="_blank" title="Bot phân tán thực hiện bởi Autobotps.com">
        Autobotps.com
      </a>
    </div>
    <div class="px-2">
      <a href="javascript:void(0)" class="satbot-logout" title="Đăng xuất">
        <i class="fa-solid fa-sign-out"></i>
      </a>
    </div>
  </div>

  <!-- Bot expired alert -->
  <div class="bot-expired">
    Bot đã hết hạn sử dụng <br> Vui lòng đăng ký lại.
    <br>
    <a href="https://autobotps.com" type="button">Đăng ký</a>
  </div>

  <!-- Nhật ký hệ thống -->
  <div class="bot-logs-header">
    <div>
      <i class="fa fa-list"></i>
      Nhật ký hệ thống
    </div>
    <div class="px-2">
      <a href="javascript:void(0)" class="bot-history-clear" title="Xóa nhật ký">
        <i class="fa-solid fa-trash"></i>
      </a>
    </div>
  </div>

  <!-- Textarea logs -->
  <textarea id="bot-logs" readonly></textarea>
</div>

    `

const tabExtContent = `
<!-- Hỗ trợ Đặt lệnh + Trạng thái lệnh + Số hợp đồng chung 1 hàng -->
<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; gap: 20px; flex-wrap: wrap;">

    <!-- Toggle ON/OFF -->
    <div style="display: flex; align-items: center; gap: 8px;">
        <label class="switch">
            <input type="checkbox" id="bot-auto-order"> <!-- thêm id ở đây -->
            <span class="slider round"></span>
        </label>
        <span>
            <b>Hỗ trợ Đặt lệnh</b> 
            <span id="bot-auto-order-status" style="font-size: 0.85rem; margin-left: 4px;"></span>
        </span>
    </div>


    <!-- Nút Trạng thái lệnh -->
    <div style="position: relative;">
        <button id="conditional-order-filters-toggle" style="background-color: #a5a5a5; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
            Trạng thái lệnh
        </button>

        <!-- Menu trạng thái lệnh -->
        <div id="bot-trendTypes" style="display: none; position: absolute; top: 35px; left: 0; width: 200px; background-color: #fff; border: 1px solid #ccc; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index: 100;">
          <div style="padding: 8px; cursor: pointer;">
              <label><input type="checkbox" name="longShortChoice" id="longshort" value="longshort"> LONG hoặc SHORT</label>
          </div>
          <div style="padding: 8px; cursor: pointer;">
              <label><input type="checkbox" name="longShortChoice" id="long" value="long"> chỉ LONG</label>
          </div>
          <div style="padding: 8px; cursor: pointer;">
              <label><input type="checkbox" name="longShortChoice" id="short" value="short"> chỉ SHORT</label>
          </div>
        </div>
    </div>

    <!-- Số hợp đồng -->
    <div style="display: flex; align-items: center; gap: 8px;">
        <span>với Số hợp đồng là</span>
        <select id="bot-volume" class="custom-select bot-settings" style="padding: 5px;">
            <option value="0" selected>Full Sức mua</option>
            <option value="1">Số HĐ =</option>
        </select>
        <input type="number" class="form-control formatDouble bot-settings" id="bot-volume-value" step="1" min="1" value="" placeholder="Số HĐ" style="width: 80px; padding: 5px;">
    </div>

    <div class="text-right">
      <a href="javascript:void(0)" class="bot-signal-refresh" title="Click để tải lại">
        <i class="fa fa-refresh"></i>
      </a>
    </div>

    <!-- Table lệnh điều kiện -->
    <div style="border: 1px solid #ccc; border-radius: 4px; overflow: hidden; width: 100%;">
      <table id="bot-tbl-signals" style="width: 100%; border-collapse: collapse;">
          <thead style="background-color: #f0f0f0; font-weight: bold;">
            <tr style="display: flex;">
                <th style="flex: 1; padding: 8px; text-align: left;">Ngày</th>
                <th style="flex: 1; padding: 8px; text-align: center;">Thời gian</th>
                <th style="flex: 1; padding: 8px; text-align: center;">Tín hiệu</th>
                <th style="flex: 1; padding: 8px; text-align: center;">Giá</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td colspan="4" style="text-align:center; padding:20px; color:#707070;">
                    Hiện không có lệnh điều kiện nào
                </td>
            </tr>
        </tbody>
      </table>
  </div>


</div>

<!-- CSS toggle ON/OFF -->
<style>
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}
.switch input {display:none;}
.slider {
  position: absolute;
  cursor: pointer;
  background-color: #ccc;
  border-radius: 24px;
  top: 0; left: 0; right: 0; bottom: 0;
  transition: .4s;
}
.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}
input:checked + .slider {background-color: #4caf50;}
input:checked + .slider:before {transform: translateX(26px);}
</style>

<!-- jQuery -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script>
$(document).ready(function(){
    // Toggle menu trạng thái lệnh
    $("#conditional-order-filters-toggle").click(function(){
      $("#bot-trendTypes").toggle();
    });

    // ====== DANH SÁCH LỰA CHỌN ======
    const choices = ["#longshort","#long","#short"];

    // ====== CHỌN CHỈ 1 TRONG 3 Ô VÀ LƯU GIÁ TRỊ ======
    choices.forEach(id=>{
        $(id).on("change", function(){
            if(this.checked){
                // Bỏ chọn các ô khác
                choices.forEach(other=>{
                    if(other !== id) $(other).prop("checked", false);
                });
                // Lưu giá trị vào localStorage
                const trendType = $(this).val();
                localStorage.setItem("bot_trendType", trendType);
                console.log("📊 Da chon trendType =", trendType);
            } else {
                // Nếu bỏ chọn hết, mặc định về longshort
                localStorage.setItem("bot_trendType", "longshort");
            }
        });
    });

    // ====== KHÔI PHỤC LỰA CHỌN SAU KHI REFRESH TRANG ======
    const savedTrend = localStorage.getItem("bot_trendType") || "longshort";
    $("#" + savedTrend).prop("checked", true);
    console.log("📊 trendType hien tai =", savedTrend);
});

// ====== HÀM DÙNG TRONG BOT ======
function getTrendType() {
    return localStorage.getItem("bot_trendType") || "longshort";
}
</script>

`

const liPanel = `<button class="Mui-autobot" 
    tabindex="-1" 
    type="button" 
    role="tab" 
    aria-selected="false" 
    id="order-book-tab-2" 
    aria-controls="order-book-tabpanel-2">
    <span class="MuiTab-wrapper">AUTO BOT</span>
    <span class="MuiTouchRipple-root"></span>
</button>`




