//const baseURL = "https://autobotps.com/v1"
const baseURL = "http://localhost:5131"
const api_auth = `${baseURL}/api/auth`
const api_signal = `${baseURL}/api/signal`
const api_logHistory = `${baseURL}/api/logHistory`
const api_profitLoss = `${baseURL}/api/profitLoss`

const timezone7 = 7 * 60 * 60 * 1000; //ms

const getISOStringNow = () => {
    var time = new Date().getTime() + timezone7;
    return new Date(time).toISOString();
}

const getAccessToken = () => getCookie("auth_token")

function loadJQuery(callback) {
    if (typeof window.jQuery === "undefined") {
        const script = document.createElement("script");
        script.src = "https://code.jquery.com/jquery-3.6.0.min.js";
        script.onload = function () {
            if (callback) callback();
        };
        document.head.appendChild(script);
    } else {
        if (callback) callback();
    }
}

loadJQuery(() => {});


const logHistory = (userId, signal, priceBuy, profitPointTP, numberContract, isSL) => {
    try {
        const isEntrade = window.location.href.includes("trading.entrade.com.vn")
        if (isEntrade) {
            const dateTime = getISOStringNow()
            const data = JSON.stringify({ signal, profitPointTP, priceBuy, numberContract, isSL, dateTime, userId })
            const token = getAccessToken()
            $.ajax({
                url: api_logHistory + "/add",
                method: "POST",
                contentType: 'application/json',
                headers: { 'Authorization': 'Bearer ' + token },
                data: data
            })
        }

    } catch (error) {
        console.log(error)
    }
}

const profitLoss = (userId, price) => {
    try {
        const isEntrade = window.location.href.includes("trading.entrade.com.vn")
        if (isEntrade) {
            const date = getISOStringNow()
            const data = JSON.stringify({ userId, date, price })
            const token = getAccessToken()
            $.ajax({
                url: api_profitLoss + "/add",
                method: "POST",
                contentType: 'application/json',
                headers: { 'Authorization': 'Bearer ' + token },
                data: data,
            })
        }
    } catch (error) {
        console.log(error)
    }
}

const add_logs = (text) => {
    var now = new Date()
    text = now.toLocaleTimeString('vi-VN') + ": " + text
    const bot_logs = $("#bot-logs");
    !bot_logs.text() ? bot_logs.text(text) : bot_logs.text(bot_logs.text() + '\n' + text);
}
const refresh_page = async () => {
    try {
        // const portfolioTab = $("#header-nav-lbl");

        // const giatab = $("#available-cash-lbl");

        // $(giatab).click();

        await new Promise(resolve => setTimeout(resolve, 200));

        // $(portfolioTab).click();

        await new Promise(resolve => setTimeout(resolve, 100));

    }
    catch (e) {
        add_logs("Làm mới thất bại");
    }
}

const showTinHieu = (tinhieu) => {
    try {
        const date = tinhieu[0].split(" ")[0]
        const time = tinhieu[0].split(" ")[1]
        const signal = tinhieu[1].split(" ")[2].slice(0, -1);
        const price = parseFloat(tinhieu[2].split(':').pop().trim()).toFixed(1)

        const tbody = $("#bot-tbl-signals tbody")
        tbody.find("td[colspan='4']").closest("tr").remove();

        const template = `<tr>
                            <td class="text-left">
                                <em><span class="date">${date}</span></em>
                            </td>
                            <td class="text-left">
                                <b><span class="time">${time}</span></b>
                            </td>
                            <td class="signal text-center ${signal}">
                                <span class="signal">${signal.toUpperCase()}</span>
                            </td>
                            <td class="text-right">
                                <span class="price" text-center="">${price}</span>
                            </td>
                        </tr>`;
        tbody.prepend(template)
    } catch (error) {
        console.log(error);
    }
}

const getBotSignal = () => {
    try {
        $.ajax({
            url: api_signal,
            success: (data) => {
                const tbody = $("#bot-tbl-signals tbody")
                tbody.find("td[colspan='4']").closest("tr").remove();
                tbody.empty()
                if (data.length > 0) {
                    data.map((sig) => {
                        const dateTime = sig.dateTime.split(' ')
                        const date = dateTime[0]
                        const time = dateTime[1]
                        const signal = sig.signal;
                        const price = sig.price;

                        const template = `<tr>
                                    <td class="text-left">
                                        <em><span class="date">${date}</span></em>
                                    </td>
                                    <td class="text-left">
                                        <b><span class="time">${time}</span></b>
                                    </td>
                                    <td class="signal text-center ${signal.toLowerCase()}">
                                        <span class="signal">${signal.toUpperCase()}</span>
                                    </td>
                                    <td class="text-right">
                                        <span class="price" text-center="">${price}</span>
                                    </td>
                                </tr>`;
                        tbody.append(template)
                    })
                }
                else {
                    tbody.html(`
                        <tr>
                            <td colspan="4" style="text-align:center; padding:20px; color:#707070;">
                                Hiện không có lệnh điều kiện nào
                            </td>
                        </tr>
                    `);
                }
            }
        })
    } catch (error) {
        console.log(error);
    }
}

const getCurrentUser = () => {
    try {
        const my_user = getCookie("bot_data")
        return my_user ? JSON.parse(my_user) : my_user
    }
    catch (error) {
        console.log(error);
    }
}

const my_logout = () => {
    try {
        const refresh_token = getCurrentUser().refresh_token;
        const json = JSON.stringify({ refresh_token });
        $.ajax({
            url: api_auth + "/logout",
            method: "POST",
            data: json,
            contentType: "application/json",
        }).done(() => {
            setCookie("auth_token", "", -1);
            setCookie("bot_data", "", -1);
            add_logs("Đã đăng xuất, trang sẽ được tải lại");
            window.location.reload();
        }).fail((xhr, status, error) => {
            status === 'timeout'
                ? add_logs("Mạng yếu, vui lòng thử lại.")
                : add_logs(error);
        });
    } catch (error) {
        console.log(error);
    }
};

const server_logout = () => {
    setCookie("auth_token", "", -1)
    setCookie("bot_data", "", -1)
    window.location.reload()
}

const refreshToken = async () => {
    try {
        const user = getCurrentUser();
        const refresh_token = user.refresh_token;

        const data = JSON.stringify({
            refresh_token
        });

        await $.ajax({
            url: api_auth + "/refresh-token",
            method: "POST",
            data: data,
            contentType: "application/json",
        }).done((data) => {
            if (data.access_token) {
                setCookie("auth_token", data.access_token, 5);
            }
        }).fail(() => {
            console.log("Phiên đăng nhập đã hết hạn");
            setCookie("bot_data", "", -1);
            // window.location.reload();
        });
    } catch (error) {
        console.log(error);
    }
};


var checkAdded
function checkTimeAndAddProfitLoss(userId) {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const today = now.toISOString().split('T')[0];

    let str = $("#deal-total-profit-lbl").text()
    let num = parseInt(str.replace(/,/g, ''), 10);

    if (hours >= 17) {
        clearInterval(checkAdded);
        return;
    }

    if ((hours > 11 || (hours === 11 && minutes >= 30)) && hours < 13) {
        const morning = getCookie('lastCalledMorning');
        if (morning !== today) {
            profitLoss(userId, num);
            setCookie('lastCalledMorning', today, 1 * 24 * 60);
        }
    }
    else if ((hours > 14 || (hours === 14 && minutes >= 30)) && hours < 17) {
        const afternoon = getCookie('lastCalledAfternoon');
        if (afternoon !== today) {
            profitLoss(userId, num);
            setCookie('lastCalledAfternoon', today, 1 * 24 * 60);
            clearInterval(checkAdded)
        }
    }
}

let isPositionClosedMorning = false;
let isPositionClosedAfternoon = false;

function checkAndClosePosition() {
    console.log("check đóng vị thế");
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    console.log(hours, minutes);

    let buy = 0;
    let sell = 0;

    $('#deal-list tbody tr').each(function () {
        const viThe = $(this).find('td[id*="position"]').text().trim();
        const klMo = $(this).find('td[id*="quantity"]').text().trim();

        if (klMo === "Đóng") return;

        if (viThe === "Mua") buy++;
        else if (viThe === "Bán") sell++;
    });

    const soViThe = buy - sell;

    if (soViThe === 0) return;

    const lenh = soViThe < 0 ? "SHORT" : "LONG";

    // ===== Đóng phiên sáng: khoảng 11h25 - 11h30 =====
    if (hours === 11 && minutes >= 25 && minutes <= 30 && !isPositionClosedMorning) {
        console.log(lenh);
        console.log("Tự động đóng vị thế cuối phiên sáng")
        runBotNormal(lenh, "MTL", Math.abs(soViThe));
        isPositionClosedMorning = true;
    }

    // ===== Đóng phiên chiều: từ 14h45 trở đi =====
    if (hours === 14 && minutes >= 44 && !isPositionClosedAfternoon) {
        console.log(lenh);
        console.log("Tự động đóng vị thế cuối phiên chieu")
        runBotNormal(lenh, "MTL", Math.abs(soViThe));
        isPositionClosedAfternoon = true;
    }
}
// ==== HÀM RESET CỜ ĐÓNG VỊ THẾ CUỐI PHIÊN ====
function resetCloseFlagsDaily() {
    console.log("check cờ đóng vị thế");
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Reset vào 8h30 sáng mỗi ngày
    if (hours === 8 && minutes === 30) {
        isPositionClosedMorning = false;
        isPositionClosedAfternoon = false;
    }
}

const botSettings = {
    enable: false,
    trendType: "0",
    volume: {
        type: "0",
        value: 0
    }
}

const scripts = [
    `${baseURL}/assets_entrade/js/common.js`,
    `${baseURL}/assets_entrade/js/signalr/dist/browser/signalr.js`
];


function loadScriptAsync(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.onload = () => resolve(url);
        script.onerror = () => reject(new Error(`Failed to load script ${url}`));
        document.body.appendChild(script);
    });
}
async function loadScripts(scripts) {
    try {
        const promises = scripts.map(scriptUrl => loadScriptAsync(scriptUrl));
        const results = await Promise.all(promises);
    } catch (error) {
        console.error('Error loading scripts:', error);
    }
}


window.addEventListener('load', async () => {
    await loadScripts(scripts)

    const isEntrade = window.location.href.includes("trading.entrade.com.vn")

    let isDemoMode = false;
    let debounceTimer = null;

    const getIsPaperTrade = () => {
        try {
            const rootData = localStorage.getItem("persist:root");
            if (!rootData) return false;
            const parsedRoot = JSON.parse(rootData);
            if (!parsedRoot.paperTrade) return false;
            const paperData = JSON.parse(parsedRoot.paperTrade);
            const authData = parsedRoot.auth ? JSON.parse(parsedRoot.auth) : {};
            const id = authData.investorId?.toString() || Object.keys(paperData)[0];
            const status = paperData[id]?.status === true;
            return status;
        } catch (err) {
            console.error("Lỗi getIsPaperTrade:", err);
            return false;
        }
    };

    const applyButtonColor = (isDemoMode) => {
        const btnGiaKhop = document.querySelector('#get-match-price-btn');
        if (!btnGiaKhop) return;

        if (isEntrade && isDemoMode) {
            btnGiaKhop.style.backgroundColor = "yellow";
            btnGiaKhop.style.color = "black";
        } else {
            btnGiaKhop.style.backgroundColor = "rgb(221, 221, 221)";
            btnGiaKhop.style.color = "rgb(51, 51, 51)";
        }
    };

    const initDemoObserver = () => {
        const paperBtn = document.querySelector('#paper-trade-btn');
        if (!paperBtn) {
            console.warn("⏳ Không tìm thấy #paper-trade-btn, thử lại sau 1s...");
            setTimeout(initDemoObserver, 1000);
            return false;
        }

        const updateStatus = () => {
            isDemoMode = getIsPaperTrade();
            applyButtonColor(isDemoMode);
            if (!isDemoMode) {
                add_logs("🚨 CẢNH BÁO: Đã chuyển sang chế độ REAL!");
                console.error("🚨 Chuyển sang REAL, bot sẽ không chạy!");
            } else {
                add_logs("✅ Đang ở chế độ DEMO");
            }
        };

        updateStatus();

        const observer = new MutationObserver(() => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(updateStatus, 300);
        });

        observer.observe(paperBtn, {
            childList: true,
            subtree: true,
            attributes: true
        });

        return true;
    };

    const watchDOM = setInterval(() => {
        if (initDemoObserver()) {
            clearInterval(watchDOM);
        }
    }, 1000);

    $.ajaxSetup({
        contentType: 'application/json',
        timeout: 10000
    })

    // const main = document.querySelector('main');
    // const div1 = main.querySelector('div');
    // const div2 = div1?.querySelectorAll('div')[0];
    // const div3 = div2?.querySelectorAll('div')[0];
    // const div4 = div3?.querySelector('div');
    // const target = div4?.querySelectorAll('div')[70];

    // const web = target
    // const root = $(packageHtml)
    // $(web).append(root);
    // root.append(loginFormHtml)

    const main = document.querySelector('main');
    const div1 = main.querySelector('div');
    const div2 = div1?.querySelectorAll('div')[0];

    if (div2) {
        // Lay danh sach tat ca cac div con trong div2
        const divChildren = div2.querySelectorAll(':scope > div');
        const targetDiv1 = divChildren[1]; // div[1] ma em noi toi

        // Tao root tu packageHtml
        const root = $(packageHtml);

        // 👉 Chen root vao TRUOC div[1]
        if (targetDiv1) {
            $(targetDiv1).before(root);
        } else {
            // Neu khong co div[1], thi append cuoi cung
            $(div2).append(root);
            console.warn("⚠️ Khong tim thay div[1], da append root vao cuoi div2");
        }

        // Chen form vao trong root
        root.append(loginFormHtml);
    }

    async function loggingAndBot(isLogin = false, userId) {
        let obsNangTP = null
        let theoDoiTrangThaiDatlenhInterval = null

        const obsDisconnect = () => {
            if (obsNangTP) {
                obsNangTP.disconnect()
                obsNangTP = null
            }
            if (theoDoiTrangThaiDatlenhInterval) {
                clearInterval(theoDoiTrangThaiDatlenhInterval)
            }
        }

        if (!isEntrade) {
            checkTimeAndAddProfitLoss(userId)
            checkAdded = setInterval(() => checkTimeAndAddProfitLoss(userId), 60000);
        }
        setInterval(checkAndClosePosition, 60000);
        setInterval(resetCloseFlagsDaily, 60 * 1000);

        const extContent = $("#ext-content")
        extContent.children().replaceWith(loggingHtml)

        const MuiTabs_flexContainer = $("div.MuiTabs-flexContainer")
        MuiTabs_flexContainer.append(liPanel)

        const tabExtPanel = $('<div role="tabpanel" id="order-book-tabpanel-2" aria-labelledby="order-book-tab-2" display="display: none" hidden></div>');

        tabExtPanel.append(tabExtContent);

        $("div[role=tabpanel]").parent().append(tabExtPanel);


        $("div.MuiTabs-flexContainer button").on("click", function () {
            const $this = $(this);

            $this.siblings(".Mui-selected").removeClass("Mui-selected").attr("aria-selected", "false");

            $this.addClass("Mui-selected").attr("aria-selected", "true");

            const left = $this.position().left;
            const width = $this.outerWidth();
            $("span.MuiTabs-indicator").css({ left: left, width: width });

            $("div[role=tabpanel]").attr("hidden", true);

            const tabpanelId = $this.attr("aria-controls");
            $("#" + tabpanelId).attr("hidden", false);
        });

        add_logs("Khởi động hệ thống")
        $(".bot-history-clear").click(function () {
            $("#bot-logs").text('')
        })

        isLogin || await refreshToken()
        setInterval(() => refreshToken(), 300000)

        function getText(colIndex) {
            try {
                const row = document.querySelector("div[aria-rowindex='1']");
                if (!row) return "";

                const cell = row.querySelector(`div[aria-colindex='${colIndex}']`);
                if (!cell) return "";

                return cell.textContent.trim();
            } catch (e) {
                console.error("getText loi:", e);
                return "";
            }
        }

        const botVolume = $("#bot-volume")
        const botVolumeValue = $("#bot-volume-value")
        const botAutoOrder = $("#bot-auto-order")
        const sucMua = parseInt($("#buy-qmax-lbl").text().match(/\d+/)[0]);
        const sucBan = parseInt($("#sell-qmax-lbl").text().match(/\d+/)[0]);
        var sohodong = $("#order-quantity-inp")

        const row1 = document.querySelector("div[aria-rowindex='1']");

        let loaiLenh = "MUA";

        const loaiLenhText = getText(3);
        loaiLenh = loaiLenhText.includes("Bán") ? "BAN" : "MUA";

        const settings = () => {
            const s = localStorage.getItem("autoBotSettings");
            return s ? JSON.parse(s) : null;
        };

        const st = settings();

        if (st) {
            botAutoOrder.prop("checked", st.enable);
            $("#bot-trendTypes input[type='checkbox']").each(function () {
                $(this).prop("checked", $(this).val() === st.trendType);
            });
            botVolume.val(st.volume.type);
            botVolumeValue.val(st.volume.value);
        }
        else {
            botVolumeValue.val(sucMua);
            botAutoOrder.prop("checked", false);
        }

        const capNhatGioiHan = () => {
            if (loaiLenh === "MUA") {
                botVolumeValue.attr("max", sucMua);
            } else {
                botVolumeValue.attr("max", sucBan);
            }
        };

        capNhatGioiHan();

        const capNhatLoaiLenh = () => {
            let loaiLenhMoi = "MUA";

            const loaiLenhText = getText(3);
            loaiLenhMoi = loaiLenhText.includes("Bán") ? "BAN" : "MUA";

            loaiLenh = loaiLenhMoi;
            capNhatGioiHan();
        };

        capNhatLoaiLenh();

        if (row1) {
            const observer = new MutationObserver(() => capNhatLoaiLenh());
            observer.observe(row1, { childList: true, subtree: true, characterData: true });
        }

        botVolume.on("change", function () {
            if ($(this).val() === "0") {
                botVolumeValue.val(loaiLenh === "MUA" ? sucMua : sucBan);
                if (botAutoOrder.is(":checked")) {
                    sohodong.val(botVolumeValue.val());
                }
            }
        });

        botVolumeValue.on("input", function () {
            let value = parseInt($(this).val());
            const max = parseInt($(this).attr("max"));
            if (value > max) $(this).val(max);

            botVolume.val("1");

            if (botAutoOrder.is(":checked")) {
                sohodong.val($(this).val());
            }

            add_logs(botVolume.find(":selected").text() + " " + $(this).val());

            localStorage.setItem("autoBotSettings", JSON.stringify({
                ...(settings() ?? botSettings),
                volume: {
                    type: botVolume.val(),
                    value: $(this).val()
                }
            }));
        });

        if (botAutoOrder.is(":checked")) {
            sohodong.val(botVolumeValue.val());
        }

        botAutoOrder.on("change", function () {
            const isChecked = $(this).is(":checked");

            if (isChecked) {
                sohodong.val(botVolumeValue.val());
                add_logs("Đã bật bot hỗ trợ đặt lệnh");
                console.log("Đã bật bot hỗ trợ đặt lệnh");
            } else {
                sohodong.val(1);
                obsDisconnect();
                add_logs("Đã tắt bot hỗ trợ đặt lệnh");
                console.log("Đã tắt bot hỗ trợ đặt lệnh");
            }

            localStorage.setItem("autoBotSettings", JSON.stringify({
                ...(settings() ?? botSettings),
                enable: isChecked
            }));
        });

        $("#bot-trendTypes input[type='checkbox']").on("change", function () {
            const labelText = $(this).parent().text().trim();
            const status = this.checked ? "ON" : "OFF";
            add_logs(`Trend "${labelText}" đã ${status}`);

            localStorage.setItem("autoBotSettings", JSON.stringify({
                ...(settings() ?? botSettings),
                trendType: $(this).val()
            }));
        });

        botVolume.on("change", function () {
            add_logs($(this).find(":selected").text() + " " + botVolumeValue.val())
            localStorage.setItem("autoBotSettings", JSON.stringify({
                ...settings() ?? botSettings,
                volume: {
                    type: $(this).val(),
                    value: botVolumeValue.val()
                }
            }))
        })

        getBotSignal()
        const debouncedGetBotSignal = debounce(() => {
            $("#bot-tbl-signals tbody").empty();
            getBotSignal()
        }, 500);

        $(".bot-signal-refresh").click(debouncedGetBotSignal)

        $(".satbot-logout").click(() => {
            if (confirm("Bạn muốn đăng xuất khỏi hệ thống auto?")) {
                my_logout()
            }
        })

        let giabandau = 0

        if (isEntrade && isDemoMode) {
            $("div.sc-cuHhuN.kSgcSi").click(function () {
                if (theoDoiTrangThaiDatlenhInterval || obsNangTP) {
                    const row1 = document.querySelector("div[aria-rowindex='1']");
                    if (!row1) {
                        console.warn("Khong tim thay dong 1 trong bang lenh");
                        return;
                    }
                    const loaiLenh = getText(3);
                    const soHopDong = getText(5);
                    const giaDat = getText(6);

                    obsDisconnect();
                    logHistory(userId, `${loaiLenh} - Lenh tay`, giabandau, giaDat, soHopDong, false);
                }
            })
        }
        else {
            $("div.sc-cuHhuN.kSgcSi").click(() => {
                if (theoDoiTrangThaiDatlenhInterval || obsNangTP) {
                    const row1 = document.querySelector("div[aria-rowindex='1']");
                    if (!row1) {
                        console.warn("Khong tim thay dong 1 trong bang lenh");
                        return;
                    }
                    const loaiLenh = getText(3);
                    const soHopDong = getText(5);
                    const giaDat = getText(6);

                    obsDisconnect();
                    logHistory(userId, `${loaiLenh} - Lenh tay`, giabandau, giaDat, soHopDong, false);
                }
            })
        }

        const funcTheoDoiSucMuaBan = () => {
            const sucmua = document.getElementById("buy-qmax-lbl");
            const sucban = document.getElementById("sell-qmax-lbl");

            if (!sucmua || !sucban) {
                console.warn("⏳ Chua tim thay suc mua / suc ban — doi 1s...");
                setTimeout(funcTheoDoiSucMuaBan, 1000);
                return;
            }

            const handleChange = (loai, node) => {
                const observer = new MutationObserver((mutationsList) => {
                    for (let mutation of mutationsList) {
                        if (mutation.type === 'characterData' || mutation.type === 'childList') {
                            let newValue = parseInt(node.textContent.replace(/[^0-9]/g, "")) || 0;
                            if (newValue < 0) newValue = 0;


                            if (botVolume.val() === "0") {
                                botVolumeValue.val(newValue);

                                const currentSettings = settings?.() ?? botSettings ?? {};
                                const newSettings = {
                                    ...currentSettings,
                                    volume: {
                                        type: botVolume.val(),
                                        value: botVolumeValue.val()
                                    }
                                };

                                localStorage.setItem("autoBotSettings", JSON.stringify(newSettings));
                            }
                        }
                    }
                });

                observer.observe(node, { characterData: true, childList: true, subtree: true });
            };

            handleChange("SUC MUA", sucmua);
            handleChange("SUC BAN", sucban);
        };

        const convertFloatToFixed = (value, fix = 1) => {
            if (typeof value !== "string") value = String(value);
            if (!value.includes(":")) return parseFloat(parseFloat(value).toFixed(fix));

            const numberString = value.split(':').pop().trim();
            const number = parseFloat(numberString).toFixed(fix);
            return parseFloat(number);
        };


        const divideNumberBy2CeilToArray = (value) => {
            let a = Math.ceil(parseInt(value) / 2)
            let b = value - a
            return [a, b]
        }

        //  -------------- CHAY TREN BANG DEMO --------------------
        const runBotNormal = (tinhieu, giadat, hopdong) => {
            console.log(`runBotNormal - isEntrade: ${isEntrade}, isDemoMode: ${isDemoMode}`);
            if (isEntrade && isDemoMode) {
                const setReactInputValue = (input, value) => {
                    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                    nativeSetter.call(input, value);
                    input.dispatchEvent(new Event("input", { bubbles: true }));
                };

                const priceInput = document.getElementById("order-price-inp");
                const qtyInput = document.getElementById("order-quantity-inp");

                if (priceInput && qtyInput) {
                    setReactInputValue(priceInput, giadat);
                    setReactInputValue(qtyInput, hopdong);
                }

                add_logs(`Đã đặt lệnh ${tinhieu} giá ${giadat} với ${hopdong} hợp đồng`);

                if (tinhieu === "LONG") {
                    const btnBuy = document.getElementById("order-buy-btn");
                    if (btnBuy) {
                        btnBuy.click();
                    }
                    else {
                        add_logs("Không tìm thấy nút MUA");
                    }
                }

                if (tinhieu === "SHORT") {
                    const btnSell = document.getElementById("order-sell-btn");
                    if (btnSell) {
                        btnSell.click();
                    }
                    else {
                        add_logs("Không tìm thấy nút BÁN");
                    }
                }
            }
        };

        //  -------------- CHAY TREN BANG DEMO --------------------
        const runBotStopOrder = async (tinhieu, hopdong, stopOrderValue) => {
            console.log(`runBotStopOrder - isEntrade: ${isEntrade}, isDemoMode: ${isDemoMode}`);
            if (isEntrade && isDemoMode) {
                const setReactInputValue = (input, value) => {
                    const nativeSetter = Object.getOwnPropertyDescriptor(
                        window.HTMLInputElement.prototype,
                        "value"
                    ).set;
                    nativeSetter.call(input, value);
                    input.dispatchEvent(new Event("input", { bubbles: true }));
                };

                // Hàm đợi phần tử render xong
                const waitForElement = async (selector, timeout = 5000) => {
                    const start = Date.now();
                    while (Date.now() - start < timeout) {
                        const el = document.querySelector(selector);
                        if (el) return el;
                        await new Promise(r => setTimeout(r, 200));
                    }
                    return null;
                };

                try {
                    const btnDieuKien = document.getElementById("condition-order-button");
                    if (btnDieuKien) {
                        btnDieuKien.click();
                        add_logs("Đã click mở tab LỆNH ĐIỀU KIỆN");
                    }
                    else {
                        add_logs("Không tìm thấy nút LỆNH ĐIỀU KIỆN (#condition-order-button)");
                        return;
                    }

                    const triggerPriceInp = await waitForElement("#trigger-price-inp", 7000);
                    if (!triggerPriceInp) {
                        add_logs("Không tìm thấy ô Giá kích hoạt (#trigger-price-inp)");
                        return;
                    }

                    setReactInputValue(triggerPriceInp, stopOrderValue);
                    add_logs(`Đã điền giá kích hoạt: ${stopOrderValue}`);


                    if (tinhieu === "LONG") {
                        const btnGreater = document.getElementById("condition-great-than-btn");
                        if (btnGreater) {
                            btnGreater.click();
                            add_logs("Chọn dấu ≥ (LONG)");
                        }
                    }
                    else {
                        const btnLess = document.getElementById("condition-less-than-btn");
                        if (btnLess) {
                            btnLess.click();
                            add_logs("Chọn dấu ≤ (SHORT)");
                        }
                    }

                    const targetPriceInp = await waitForElement("#target-price-inp", 3000);
                    if (targetPriceInp) {
                        setReactInputValue(targetPriceInp, stopOrderValue);
                        add_logs(`Điền giá đặt: ${stopOrderValue}`);
                    }

                    const targetQtyInp = await waitForElement("#target-quantity-inp", 3000);
                    if (targetQtyInp) {
                        setReactInputValue(targetQtyInp, hopdong);
                        add_logs(`Điền khối lượng: ${hopdong}`);
                    }

                    await new Promise(r => setTimeout(r, 500));

                    if (tinhieu === "LONG") {
                        const btnBuy = document.getElementById("order-buy-btn");
                        if (btnBuy && !btnBuy.disabled) {
                            btnBuy.click();
                            add_logs(`Đã gửi lệnh MUA điều kiện (giá ${stopOrderValue}, SL ${hopdong})`);
                        } else {
                            add_logs("Nút MUA bị disable hoặc chưa sẵn sàng");
                        }
                    }
                    else {
                        const btnSell = document.getElementById("order-sell-btn");
                        if (btnSell && !btnSell.disabled) {
                            btnSell.click();
                            add_logs(`Đã gửi lệnh BÁN điều kiện (giá ${stopOrderValue}, SL ${hopdong})`);
                        } else {
                            add_logs("Nút BÁN bị disable hoặc chưa sẵn sàng");
                        }
                    }

                    const main = document.querySelector('main');
                    const div1 = main.querySelector('div');
                    const div2 = div1?.querySelectorAll('div')[0];
                    const div3 = div2?.querySelectorAll('div')[0];
                    const div4 = div3?.querySelector('div');
                    const div5 = div4?.querySelectorAll('div')[70];
                    const div6 = div5?.querySelectorAll('div')[0];

                    // 👉 Lay nut dau tien trong div6 va click
                    const btn = div6?.querySelector("button");
                    if (btn) {
                        btn.click();
                        add_logs("Da click nut dau tien trong div6");
                    } else {
                        add_logs("Khong tim thay nut dau tien trong div6");
                    }


                } catch (err) {
                    console.error(err);
                    add_logs("Lỗi khi đặt lệnh điều kiện: " + err.message);
                }
            }
        };

        //  -------------- CHAY TREN BANG DEMO --------------------
        const huyLenhThuong = () => {
            console.log(`huylenhthuong - isEntrade: ${isEntrade}, isDemoMode: ${isDemoMode}`);
            if (isEntrade && isDemoMode) {
                const btnCancelAll = $("#order-cancel-all-btn");

                if (btnCancelAll.length === 0) {
                    console.warn("⚠️ Không tìm thấy nút 'Huỷ tất cả lệnh'");
                    return;
                }
                $(".cancel-all-confirm").css("display", "none");

                const checkActive = setInterval(() => {
                    const isDisabled = btnCancelAll.prop("disabled") || btnCancelAll.hasClass("Mui-disabled");

                    if (!isDisabled && btnCancelAll.is(":visible")) {
                        clearInterval(checkActive);

                        btnCancelAll.trigger("click");

                        $(".cancel-all-confirm").css("display", "");

                        add_logs("Đã huỷ tất cả lệnh thường");
                    }
                }, 300);
            }
        };

        //  -------------- CHAY TREN BANG DEMO --------------------
        const huyLenhDieuKien = () => {
            console.log(`huylenhdieukien - isEntrade: ${isEntrade}, isDemoMode: ${isDemoMode}`);
            if (isEntrade && isDemoMode) {
                const tabBtn = $("#order-book-tab-1");
                if (tabBtn.length) {
                    tabBtn.trigger("click");
                } else {
                    console.warn("⚠️ Không tìm thấy nút tab 'Sổ lệnh điều kiện'");
                }

                const checkCancelBtn = setInterval(() => {
                    const cancelBtn = $("#conditional-order-cancel-all-btn");
                    if (cancelBtn.length && !cancelBtn.prop("disabled") && !cancelBtn.hasClass("Mui-disabled")) {
                        clearInterval(checkCancelBtn);
                        cancelBtn.trigger("click");
                    }
                }, 400);

                setTimeout(() => clearInterval(checkCancelBtn), 10000);
            }

            add_logs("Đã hủy tất cả lệnh điều kiện chờ kích hoạt");
        };

        //  -------------- CHAY TREN BANG DEMO --------------------
        const huyViTheHienTai = () => {
            console.log(`huyvithehientai - isEntrade: ${isEntrade}, isDemoMode: ${isDemoMode}`);
            if (isEntrade && isDemoMode) {
                huyLenhThuong()
                huyLenhDieuKien()

                const closeButtons = $("#deal-list button[id^='deal-row-'][id$='close-btn']")

                let daDong = false

                closeButtons.each(function () {
                    if (!$(this).is(":disabled")) {
                        $(this).click()
                        daDong = true
                        add_logs("Đã đóng 1 vị thế trong bảng DEAL")
                    }
                })

                if (!daDong) {
                    add_logs("Không có vị thế nào đang mở để đóng")
                }
            }
        }

        const daoLenh = (tinhieu) => tinhieu === "LONG" ? "SHORT" : "LONG"

        const capNhatDanhSachLenh = () => {
            console.log(`capnhatdanhsachlenh - isEntrade: ${isEntrade}, isDemoMode: ${isDemoMode}`);
            if (isEntrade && isDemoMode) {
                try {
                    const tabSoLenh = $('button[id^="order-book-tab-"]').filter(function () {
                        return $(this).text().includes("Sổ lệnh");
                    });
                    if (tabSoLenh.length) {
                        tabSoLenh[0].click();
                    }

                    const nutTrangThai = $('#order-filters-toggle');
                    if (!nutTrangThai.length) {
                        console.warn("Không tìm thấy nút Trạng thái lệnh");
                        return;
                    }

                    nutTrangThai[0].click();

                    setTimeout(() => {
                        const menuItems = $('body').find('li, label, span').filter(function () {
                            return $(this).text().trim() === 'Tất cả';
                        });

                        if (menuItems.length) {
                            menuItems.first().click();

                            setTimeout(() => {
                                $(document.body).trigger('mousedown');
                                $(document.body).trigger('click');
                            }, 300);
                        } else {
                            console.warn("Không tìm thấy mục 'Tất cả' trong menu Trạng thái lệnh");
                        }
                    }, 500);
                } catch (e) {
                    console.error("Lỗi khi cập nhật danh sách lệnh:", e);
                }
            }
        };

        const demViThe = () => {
            console.log(`demvithe - isEntrade: ${isEntrade}, isDemoMode: ${isDemoMode}`);
            if (isEntrade && isDemoMode) {
                let buy = 0;
                let sell = 0;

                $('#deal-list tbody tr').each(function () {
                    const viThe = $(this).find('td[id*="position"]').text().trim();
                    const klMo = $(this).find('td[id*="quantity"]').text().trim();

                    if (klMo === "Đóng") return;

                    if (viThe === "Mua") buy++;
                    else if (viThe === "Bán") sell++;
                });

                const soViThe = buy - sell;

                return { buy, sell, soViThe };
            }
        };

        const parseStrToFloat = (str) => parseFloat(str.replace(/,/g, ''))

        const botAutoClick = async (arr, fullHopdong = parseInt(botVolumeValue.val()), isAdmin = false) => {
            refresh_page();

            console.log("🧩 arr nhan vao:", arr);
            console.log("⚙️ fullHopdong ban dau:", fullHopdong, "| isAdmin:", isAdmin);

            let tinhieu = arr[1].toUpperCase() == "TIN HIEU: LONG" ? "LONG" : "SHORT";
            console.log("------------Tin Hieu------------ " + tinhieu);
            add_logs("Tín hiệu: " + tinhieu);

            obsDisconnect();

            let dadatTp1 = false;
            let dadatTp2 = false;
            let daHuyInitCancel = false;
            let daHuyTp1Cancel = false;

            const type = arr[arr.length - 1].split(" ");
            const daGuiReverse = arr[arr.length - 1] === "REVERSE" || type[0] === "REVERSE";
            const { buy, sell, soViThe } = demViThe();

            const daoChieu = daGuiReverse && (
                (tinhieu === "LONG" && soViThe < 0) ||
                (tinhieu === "SHORT" && soViThe > 0)
            );

            const isLong = tinhieu === "LONG";
            let my_hd = fullHopdong;
            const ngDat = parseInt(botVolumeValue.val());
            const soSucMuaBan = tinhieu === "LONG" ? sucMua : sucBan;

            console.log("🔍 Kiem tra thong tin ban dau:");
            console.log({ tinhieu, daGuiReverse, daoChieu, buy, sell, soViThe, isLong, my_hd, fullHopdong, ngDat, soSucMuaBan });

            // --- DAO CHIEU ---
            if (daoChieu) {
                add_logs("Tín hiệu đảo chiều!");
                console.log("🚀 DAO CHIEU duoc kich hoat");

                if (botVolume.val() === "0") {
                    console.log("📊 Che do: FULL suc mua");
                    if (soViThe && !soSucMuaBan) {
                        console.log("❗ Co vi the nhung khong co suc mua");
                        if (isAdmin) {
                            if (Math.abs(soViThe) >= fullHopdong) {
                                fullHopdong += Math.abs(soViThe);
                            } else {
                                my_hd = Math.abs(soViThe);
                                fullHopdong = Math.abs(soViThe) * 2;
                            }
                        } else {
                            add_logs("Đảo chiều khi để full sức mua và không có sức mua");
                            my_hd = Math.abs(soViThe);
                            fullHopdong = Math.abs(soViThe) * 2;
                            add_logs(`my_hd: ${my_hd}, fullHopdong: ${fullHopdong}`);
                        }
                    }
                    else if (!soViThe && soSucMuaBan) {
                        console.log("❗ Khong co vi the, co suc mua");
                        if (isAdmin) {
                            if (fullHopdong > ngDat) {
                                my_hd = ngDat;
                                fullHopdong = ngDat;
                            }
                        } else {
                            add_logs("Đảo chiều khi để full sức mua, không vị thế , có sức mua");
                            my_hd = ngDat;
                            fullHopdong = ngDat;
                        }
                    }
                    else if (soViThe && soSucMuaBan) {
                        console.log("❗ Co vi the va co suc mua");
                        if (isAdmin) {
                            if ((Math.abs(soViThe) + ngDat) < fullHopdong) {
                                my_hd = (Math.abs(soViThe) + ngDat);
                                fullHopdong = Math.abs(soViThe) * 2 + ngDat;
                            } else {
                                my_hd = fullHopdong;
                                fullHopdong += Math.abs(soViThe);
                            }
                        } else {
                            add_logs("Đảo chiều khi để full sức mua, có vị thế , có sức mua");
                            my_hd = (Math.abs(soViThe) + ngDat);
                            fullHopdong = Math.abs(soViThe) * 2 + ngDat;
                        }
                    }
                }
                else {
                    console.log("📊 Che do: SET volume");
                    if (soViThe && !soSucMuaBan) {
                        console.log("❗ Co vi the nhung khong co suc mua");
                        if (isAdmin) {
                            if (Math.abs(soViThe) >= fullHopdong) {
                                fullHopdong += Math.abs(soViThe);
                            } else {
                                my_hd = Math.abs(soViThe);
                                fullHopdong = Math.abs(soViThe) * 2;
                            }
                        } else {
                            add_logs("Đảo chiều khi set volume và không có sức mua ");
                            my_hd = Math.abs(soViThe);
                            fullHopdong += Math.abs(soViThe);
                        }
                    }
                    else if (!soViThe && soSucMuaBan) {
                        console.log("❗ Khong co vi the, co suc mua");
                        if (isAdmin) {
                            if (fullHopdong > ngDat) {
                                my_hd = ngDat;
                                fullHopdong = ngDat;
                            }
                        } else {
                            my_hd = ngDat;
                            fullHopdong = ngDat;
                        }
                    }
                    else if (soViThe && soSucMuaBan) {
                        console.log("❗ Co vi the va co suc mua");
                        if (isAdmin) {
                            if (fullHopdong > ngDat) {
                                my_hd = ngDat;
                                fullHopdong = ngDat + Math.abs(soViThe);
                            } else {
                                fullHopdong += Math.abs(soViThe);
                            }
                        } else {
                            my_hd = ngDat;
                            fullHopdong = ngDat + Math.abs(soViThe);
                        }
                    }
                }

                console.log("📈 Sau DAO CHIEU -> my_hd:", my_hd, "fullHopdong:", fullHopdong);
                huyLenhThuong();
                huyLenhDieuKien();
                add_logs("Huy lenh sau dao chieu");
            }
            else {
                console.log("🟢 KHONG DAO CHIEU");
                if (soViThe) {
                    console.log("⚖️ Dang co vi the hien tai:", soViThe);
                    if (isAdmin) {
                        if (fullHopdong > ngDat) {
                            my_hd = ngDat + Math.abs(soViThe);
                            fullHopdong = ngDat;
                        } else {
                            my_hd += Math.abs(soViThe);
                        }
                    } else {
                        const lastTP = JSON.parse(localStorage.getItem("lastTP"));
                        console.log("📦 lastTP:", lastTP);
                        if (lastTP) {
                            add_logs(`Lệnh trước đã TP ${lastTP.level} tại giá ${lastTP.price}, SL: ${lastTP.contracts}`);
                            if (lastTP.level === "TP1") {
                                my_hd = ngDat;
                                fullHopdong = Math.ceil(ngDat * 0.5);
                            }
                            else if (lastTP.level === "TP2") {
                                my_hd = ngDat;
                                fullHopdong = Math.ceil(ngDat * 0.75);
                            }
                        } else {
                            my_hd = ngDat + Math.abs(soViThe);
                            fullHopdong = ngDat;
                        }
                    }
                } else {
                    console.log("⚪ Khong co vi the truoc do");
                    if (isAdmin) {
                        if (fullHopdong > ngDat) {
                            my_hd = ngDat;
                            fullHopdong = ngDat;
                        }
                    } else {
                        my_hd = ngDat;
                        fullHopdong = ngDat;
                    }
                }
            }

            console.log("📊 Gia tri cuoi truoc khi dat lenh:", { my_hd, fullHopdong, ngDat, soViThe, daoChieu });

            let giamua = convertFloatToFixed(arr[2]);
            let catLo = convertFloatToFixed(arr[7]);

            if (!isAdmin) {
                tinhieu === "LONG" ? giamua += 0.5 : giamua -= 0.5;
                giamua = parseFloat(giamua.toFixed(1));
            }

            const tp1 = convertFloatToFixed(arr[3]);
            const tp2 = convertFloatToFixed(arr[4]);

            console.log(arr);
            console.log("💰 Muc gia:", { giamua, tp1, tp2, catLo });

            const order50 = divideNumberBy2CeilToArray(my_hd);
            const order25 = divideNumberBy2CeilToArray(order50[1]);

            console.log("📈 order50:", order50, "| order25:", order25);

            const trendType = $('#bot-trendTypes input[type="checkbox"]:checked').val();
            console.log("📊 trendType:", trendType);



            if (((trendType == "long" && tinhieu == "LONG") ||
                (trendType == "short" && tinhieu == "SHORT") ||
                trendType == "longshort") && fullHopdong > 0) {

                console.log("🚀 Bat dau dat lenh chinh voi:", { tinhieu, giamua, fullHopdong });
                runBotNormal(tinhieu, giamua, fullHopdong);

                const funcNangTP = () => {
                    localStorage.removeItem("lastTP")
                    logHistory(userId, tinhieu, giamua, giamua, fullHopdong, false)
                    giabandau = giamua

                    //dao lenh
                    const tinHieuDao = daoLenh(tinhieu)

                    runBotStopOrder(tinHieuDao, my_hd, catLo)

                    //Chot 50%
                    if (order50[0] > 0) {
                        console.log("Chot 50%")
                        runBotNormal(tinHieuDao, tp1, order50[0])
                    }

                    //Chot 25%
                    if (order25[0] > 0) {
                        console.log("Chot 25%")
                        runBotNormal(tinHieuDao, tp2, order25[0])
                    }

                    const funcTheoDoiGiaKhopLenh = () => {
                        console.log("🚀 [funcTheoDoiGiaKhopLenh] Bat dau theo doi gia khop...");

                        let nodeGiaKhop = null;

                        try {
                            // 1️⃣ tìm node cha
                            const root = document.querySelector(".sc-iSmSVH.fJlkgS");
                            if (!root) {
                                console.warn("⚠️ Không tìm thấy .sc-iSmSVH.fJlkgS, thu lai sau 1s...");
                                setTimeout(funcTheoDoiGiaKhopLenh, 1000);
                                return;
                            }

                            // 2️⃣ đi theo cấu trúc div[2] -> div[1]
                            const div2 = root.children[2];
                            const div1 = div2?.children[1];
                            nodeGiaKhop = div1?.querySelector("p.sc-drFUgV.hNoIye");

                            if (!nodeGiaKhop) {
                                console.warn("⚠️ Không tìm thấy node giá khớp, thu lai sau 1s...");
                                setTimeout(funcTheoDoiGiaKhopLenh, 1000);
                                return;
                            }

                            console.log("✅ Node giá khớp tìm được:", nodeGiaKhop);
                            console.log("✅ Giá khớp hiện tại:", nodeGiaKhop.innerText.trim());

                        } catch (err) {
                            console.error("❌ Lỗi khi tìm node giá khớp:", err);
                            setTimeout(funcTheoDoiGiaKhopLenh, 1000);
                            return;
                        }

                        // 🟢 Tạo observer theo dõi thay đổi giá
                        const obsNangTP = new MutationObserver(mutationsList => {
                            for (let mutation of mutationsList) {
                                if (mutation.type === 'characterData' || mutation.type === 'childList') {
                                    const textGia = nodeGiaKhop.textContent.trim();
                                    const giaKhopLenh = parseStrToFloat(textGia);

                                    if (isNaN(giaKhopLenh)) {
                                        console.log("⚠️ Giá khớp không hợp lệ, bỏ qua...");
                                        continue;
                                    }

                                    console.log("💹 Giá khớp mới:", giaKhopLenh);

                                    // === PHẦN XỬ LÝ TP1, TP2, CAT LO ===
                                    const isShort = tinhieu === "SHORT";

                                    const condition1 = isShort
                                        ? giaKhopLenh <= tp1 && giaKhopLenh > tp2
                                        : giaKhopLenh >= tp1 && giaKhopLenh < tp2;

                                    const condition2 = isShort
                                        ? giaKhopLenh <= tp2
                                        : giaKhopLenh >= tp2;

                                    const shdTP1 = my_hd - parseInt(order50[0]);
                                    const shdTP2 = my_hd - parseInt(order50[0]) - parseInt(order25[0]);

                                    // --- TP1 ---
                                    if (condition1 && !dadatTp1 && shdTP1 > 0) {
                                        console.log("🎯 Kích hoạt TP1");
                                        huyLenhDieuKien();
                                        add_logs("Hủy lệnh sau khi chốt TP1");

                                        add_logs("1444")
                                        const handler = () => runBotStopOrder(tinHieuDao, shdTP1, giamua);
                                        (isEntrade && isDemoMode) ? setTimeout(handler, 1000) : handler();

                                        dadatTp1 = true;
                                        localStorage.setItem("lastTP", JSON.stringify({
                                            level: "TP1", time: new Date().toISOString(), price: tp1, contracts: shdTP1
                                        }));
                                        logHistory(userId, tinhieu, giamua, tp1, shdTP1, false);
                                        giabandau = tp1;
                                    }

                                    // --- TP2 ---
                                    else if (condition2 && !dadatTp2 && shdTP2 > 0) {
                                        console.log("🎯 Kích hoạt TP2");
                                        huyLenhDieuKien();
                                        add_logs("Hủy lệnh sau khi chốt TP2");

                                        add_logs("1462")
                                        const handler = () => runBotStopOrder(tinHieuDao, shdTP2, tp1);
                                        (isEntrade && isDemoMode) ? setTimeout(handler, 1000) : handler();

                                        dadatTp1 = true;
                                        dadatTp2 = true;
                                        localStorage.setItem("lastTP", JSON.stringify({
                                            level: "TP2", time: new Date().toISOString(), price: tp2, contracts: shdTP2
                                        }));
                                        logHistory(userId, tinhieu, tp1, tp2, shdTP2, false);
                                        giabandau = tp2;
                                    }

                                    // --- CAT LO ---
                                    const initCancelCondition = isShort
                                        ? giaKhopLenh >= catLo && !dadatTp1 && !dadatTp2
                                        : giaKhopLenh <= catLo && !dadatTp1 && !dadatTp2;

                                    const tp1Condition = isShort
                                        ? giaKhopLenh >= giamua && dadatTp1 && !dadatTp2
                                        : giaKhopLenh <= giamua && dadatTp1 && !dadatTp2;

                                    if (initCancelCondition && !daHuyInitCancel) {
                                        console.log("❌ Hủy lệnh do đạt cắt lỗ");
                                        huyLenhThuong();
                                        add_logs("Hủy lệnh sau khi cắt lỗ");
                                        daHuyInitCancel = true;
                                        logHistory(userId, tinhieu, giamua, catLo, my_hd, true);
                                    } else if (tp1Condition && !daHuyTp1Cancel) {
                                        console.log("❌ Hủy lệnh sau TP1 nhưng giá quay lại điểm vào");
                                        huyLenhThuong();
                                        add_logs("Hủy lệnh sau khi quay về TP1");
                                        daHuyInitCancel = true;
                                        daHuyTp1Cancel = true;
                                        logHistory(userId, tinhieu, giamua, tp1, shdTP1, true);
                                    }
                                }
                            }
                        });

                        // bắt đầu theo dõi
                        obsNangTP.observe(nodeGiaKhop, { childList: true, characterData: true, subtree: true });
                        console.log("👀 Đang theo dõi thay đổi của node giá khớp:", nodeGiaKhop);
                    };

                    funcTheoDoiGiaKhopLenh();
                }

                const funcTheoDoiTrangThaiDat = () => {
                    let lenhFullHd
                    if (isEntrade && isDemoMode) {
                        lenhFullHd = getText(9);
                    }

                    if (!lenhFullHd) {
                        setTimeout(funcTheoDoiTrangThaiDat, 1000)
                    }
                    else {
                        const trangthaiBanDau = lenhFullHd
                        if (trangthaiBanDau == 'Khớp') {
                            funcNangTP()
                            if (theoDoiTrangThaiDatlenhInterval) {
                                clearInterval(theoDoiTrangThaiDatlenhInterval)
                            }
                        }
                        else {
                            const huyLenhSau90s = setTimeout(() => {
                                let nodeTrangThai
                                if (isEntrade && isDemoMode) {
                                    nodeTrangThai = getText(9);
                                }

                                if (!nodeTrangThai) return;

                                const trangthai = nodeTrangThai
                                if (theoDoiTrangThaiDatlenhInterval) {
                                    clearInterval(theoDoiTrangThaiDatlenhInterval)
                                }
                                if (trangthai == 'Chờ khớp') {
                                    add_logs("Trạng thái lệnh: " + trangthai)
                                    huyLenhThuong()
                                    add_logs("Huy lenh sau khi het timeout")
                                }
                            }, 90000)

                            capNhatDanhSachLenh()

                            theoDoiTrangThaiDatlenhInterval = setInterval(() => {
                                let nodeTrangThai
                                if (isEntrade && isDemoMode) {
                                    nodeTrangThai = getText(9)
                                }

                                if (!nodeTrangThai) return;

                                const trangthai = nodeTrangThai

                                if (trangthai == 'Đã khớp') {
                                    funcNangTP()
                                    if (huyLenhSau90s) {
                                        clearTimeout(huyLenhSau90s)
                                    }
                                    if (theoDoiTrangThaiDatlenhInterval) {
                                        clearInterval(theoDoiTrangThaiDatlenhInterval)
                                    }
                                }
                                else capNhatDanhSachLenh()
                            }, 1500)
                        }
                    }
                }
                setTimeout(capNhatDanhSachLenh, 500)
                setTimeout(funcTheoDoiTrangThaiDat, 2000)

            } else {
                console.warn("⚠️ Dieu kien trendType khong phu hop, khong thuc hien dat lenh");
            }

            console.log("-------------------------------------------");
        }


        var connection = new signalR.HubConnectionBuilder()
            .withUrl(`${baseURL}/realtimeSignal`, {
                accessTokenFactory: () => getAccessToken()
            })
            .configureLogging(signalR.LogLevel.None)
            .withAutomaticReconnect()
            .build()

        connection.on("Signal", function (message) {
            const tinhieu = message.split("\n").map(line => line.trim());
            showTinHieu(tinhieu);
            if (botAutoOrder.is(":checked") && getIsPaperTrade()) {
                console.log(`✅ Nhận tín hiệu trên DEMO: ${message}`);
                add_logs("1598")
                botAutoClick(tinhieu);
            } else {
                add_logs("⛔ BỎ QUA TÍN HIỆU: Không phải chế độ DEMO hoặc bot chưa bật!");
            }
        });


        connection.on("ServerMessage", function (message) {
            if (message == "LOGOUT") {
                obsDisconnect()
                connection.stop()
                add_logs("Tài khoản đã đăng nhập từ trình duyệt khác, bạn sẽ bị đăng xuất.")
                setTimeout(server_logout, 1000)
            }
        })

        connection.on("AdminSignal", function (message) {
            if (botAutoOrder.is(":checked") && getIsPaperTrade()) {
                console.log(`✅ Nhận tín hiệu admin trên DEMO: ${message}`);
                if (message == "CANCEL_ALL") {
                    add_logs("Admin: Hủy tất cả lệnh");
                    huyLenhThuong();
                    huyLenhDieuKien();
                    obsDisconnect();
                } else if (message == "CANCEL_VITHE") {
                    add_logs("Admin: Hủy vị thế hiện tại");
                    huyViTheHienTai();
                    obsDisconnect();
                } else if (message.includes("STOP_ORDER_ONLY")) {
                    const arr = message.split("\n").map(line => line.trim());
                    const tinhieu = arr[1].toUpperCase();
                    let sohd = parseInt(arr[2]);
                    const sl = parseFloat(parseFloat(arr[3]).toFixed(1));
                    if (sohd > botVolumeValue.val()) {
                        sohd = botVolumeValue.val();
                    }
                    if (sohd > 0) {
                        add_logs("1634")
                        runBotStopOrder(tinhieu, sohd, sl);
                    } else {
                        add_logs("Số hợp đồng phải lớn hơn 0");
                    }
                } else {
                    const arr = message.split("\n").map(line => line.trim());
                    showTinHieu(arr);
                    const type = arr[arr.length - 1].split(" ");
                    let hopdong = botVolumeValue.val();
                    if ((type[1] || type[2]) && (parseInt(type[1]) > 0 || parseInt(type[2]) > 0)) {
                        let hd = parseInt(type[1]) || parseInt(type[2]);
                        hopdong = hd;
                    }
                    if (type[0] === "NO_STOP_ORDER" || type[1] === "NO_STOP_ORDER") {
                        const tinhieu = arr[1].toUpperCase() === "TIN HIEU LONG: MANH" ? "LONG" : "SHORT";
                        let giamua = convertFloatToFixed(arr[2]);
                        if (hopdong > botVolumeValue.val()) {
                            hopdong = botVolumeValue.val();
                        }
                        if (hopdong > 0) {
                            runBotNormal(tinhieu, giamua, hopdong);
                        } else {
                            add_logs("Số hợp đồng phải lớn hơn 0");
                        }

                    } else {
                        add_logs("1662")
                        botAutoClick(arr, hopdong, true);
                    }
                }
            } else {
                add_logs("⛔ BỎ QUA TÍN HIỆU ADMIN: Không phải chế độ DEMO hoặc bot chưa bật!");
            }
        });

        await connection.start().then(() => {
            add_logs("Đã kết nối với tín hiệu bot")
            console.log(`[${new Date().toISOString()}] Connected`)
        }).catch((err) => console.error(err))

        $('a[data-original-title="Logout"]').click(function () {
            connection.stop()
        })

        add_logs("Hệ thống sẳn sàng")
    }

    const autobotps_user = getCurrentUser();

    if (autobotps_user) {
        loggingAndBot(false, autobotps_user.userId);
    } else {
        $('#cb_showPassword').on('change', function () {
            const showPassword = $(this).is(':checked');
            $('#cb_password').attr('type', showPassword ? 'text' : 'password');
        });

        $('#cb_login').click(async function () {
            const $statusElement = $('#cb_loginStatus');
            try {
                $statusElement.text('').removeClass('alert-danger alert-info');
                const username = $('#cb_username').val().trim();
                if (!username) throw new Error("Vui lòng nhập tên đăng nhập");

                const password = $('#cb_password').val();
                if (!password) throw new Error("Mật khẩu không được để trống");

                $statusElement
                    .removeClass('alert-danger')
                    .addClass('alert-info')
                    .text('Đang đăng nhập...');
                $(this).attr("disabled", true);

                const data = JSON.stringify({
                    username,
                    password
                });

                $.ajax({
                    url: api_auth + "/login",
                    method: "POST",
                    data: data
                })
                    .done((data) => {
                        if (data.access_token) {
                            setCookie("auth_token", data.access_token, 5);
                            delete data.access_token;
                            setCookie("bot_data", JSON.stringify(data), 1 * 24 * 60);
                            loggingAndBot(true, data.userId);
                        } else {
                            $statusElement
                                .text(data.error)
                                .removeClass('alert-info')
                                .addClass('alert-danger');
                        }
                    })
                    .fail((e, error) => {
                        const msg =
                            error === 'timeout'
                                ? "Mạng yếu, vui lòng thử lại."
                                : e.responseText ?? "Có lỗi xảy ra";

                        $statusElement
                            .text(msg)
                            .removeClass('alert-info')
                            .addClass('alert-danger');
                        $(this).attr("disabled", false);
                    });
            } catch (error) {
                $statusElement
                    .text(error.message ?? "Có lỗi xảy ra")
                    .removeClass('alert-info')
                    .addClass('alert-danger');
                $(this).attr("disabled", false);
            }
        });
    }
})

