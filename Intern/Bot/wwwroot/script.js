const baseURL = "https://autobotps.com/v1"

const api_auth = `${baseURL}/api/auth`
const api_signal = `${baseURL}/api/signal`
const api_logHistory = `${baseURL}/api/logHistory`
const api_profitLoss = `${baseURL}/api/profitLoss`

const timezone7 = 7 * 60 * 60 * 1000; //ms

const getISOStringNow = () => {
    var time = new Date().getTime() + timezone7;
    return new Date(time).toISOString();
}

const logHistory = (signal, priceBuy, profitPointTP, numberContract, isSL) => {
    try {
        const userId = getCurrentUser().userId
        const dateTime = getISOStringNow()
        const data = JSON.stringify({ signal, profitPointTP, priceBuy, numberContract, isSL, dateTime, userId })
        $.ajax({
            url: api_logHistory + "/add",
            method: "POST",
            headers: { 'Authorization': 'Bearer ' + getAccessToken() },
            data: data,
        })
    } catch (error) {
        console.log(error)
    }
}

const profitLoss = (price) => {
    try {
        const userId = getCurrentUser().userId
        const date = getISOStringNow()
        const data = JSON.stringify({ userId, date, price })
        $.ajax({
            url: api_profitLoss + "/add",
            method: "POST",
            headers: { 'Authorization': 'Bearer ' + getAccessToken() },
            data: data,
        })
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

const showTinHieu = (tinhieu) => {
    try {
        const date = tinhieu[0].split(" ")[2]
        const time = tinhieu[0].split(" ")[3]
        const signal = tinhieu[1].split(" ")[2].slice(0, -1);
        const price = parseFloat(tinhieu[2].split(':').pop().trim()).toFixed(2)

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
        $("#signal-header").after(template)
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
            }
        })
    } catch (error) {
        console.log(error);
    }
}

const getCurrentUser = () => {
    const my_user = getCookie("bot_data")
    return my_user ? JSON.parse(my_user) : my_user
}

const getAccessToken = () => getCookie("auth_token")

const my_logout = () => {
    try {
        const refresh_token = getCurrentUser()?.refresh_token;
        const json = JSON.stringify({ refresh_token })
        $.ajax({
            url: api_auth + "/logout",
            method: "POST",
            data: json,
        }).done(() => {
            setCookie("auth_token", "", -1)
            setCookie("bot_data", "", -1)
            add_logs("Đã đăng xuất, trang sẽ được tải lại")
            window.location.reload()
        }).fail((_, error) => {
            error === 'timeout'
                ? add_logs("Mạng yếu, vui lòng thử lại.")
                : add_logs(error)
        })
    } catch (error) {
        console.log(error);
    }
}

const server_logout = () => {
    setCookie("auth_token", "", -1)
    setCookie("bot_data", "", -1)
    window.location.reload()
}

const refreshToken = async () => {
    try {
        const refresh_token = getCurrentUser().refresh_token;
        const data = JSON.stringify({ refresh_token })

        await $.ajax({
            url: api_auth + "/refresh-token",
            method: "POST",
            data: data
        }).done((data) => {
            if (data.access_token) {
                setCookie("auth_token", data.access_token, 5);
            }
        }).fail(() => {
            console.log("Phiên đăng nhập đã hết hạn")
            setCookie("bot_data", "", -1)
            window.location.reload()
        })
    } catch (error) {
        console.log(error)
    }
}

var checkAdded
function checkTimeAndAddProfitLoss() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const today = now.toISOString().split('T')[0];
    
    let str = $("#vmAccInfo").text()
    let num = parseInt(str.replace(/,/g, ''), 10);

    if ((hours > 11 || (hours === 11 && minutes >= 30)) && hours < 13) {
        const morning = getCookie('lastCalledMorning');
        if (morning !== today) {
            profitLoss(num);
            setCookie('lastCalledMorning', today, 1 * 24 * 60);
        }
    }
    else if (hours > 14 || (hours === 14 && minutes >= 30) && hours < 17) {
        const afternoon = getCookie('lastCalledAfternoon');
        if (afternoon !== today) {
            profitLoss(num);
            setCookie('lastCalledAfternoon', today, 1 * 24 * 60);
            clearInterval(checkAdded)
        }
    }
    else if (hours >= 17) clearInterval(checkAdded)
}

const botSettings = {
    enable: false,
    trendType: "0",
    volume: {
        type: "0",
        value: 0
    }
}
// const scripts = `<script src="${baseURL}/assets/js/common.js"></script>
//                 <script src="${baseURL}/assets/js/signalr/dist/browser/signalr.js"></script>`

const scripts = [
   `${baseURL}/assets/js/common.js`,
   `${baseURL}/assets/js/signalr/dist/browser/signalr.js`
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

    $.ajaxSetup({
        contentType: 'application/json',
        timeout: 10000
    })

    const isDemo = window.location.href.includes("smarteasy.vps.com.vn")

    isDemo ? $(".btn.btn-block.btn-default.active.btn-cancel-all").addClass("text-white btn-warning")
        : $("#button_cancel_all_order_normal").addClass("text-white bg-warning")

    const web = $("div#orderPS.tab-pane.active")
    const root = $(packageHtml)
    web.append(root)
    root.append(loginFormHtml)

    async function loggingAndBot(isLogin = '') {
        var obs
        var obsTheoDoiTrangThaiDat

        checkTimeAndAddProfitLoss()
        checkAdded = setInterval(checkTimeAndAddProfitLoss, 60000);

        const extContent = $("#ext-content")
        extContent.children().replaceWith(loggingHtml)

        const ulPanel = $("#ulPanel")
        ulPanel.addClass("flex-nowrap")
        ulPanel.append(liPanel)

        $("#ngiaIndex").after(tabExtContent)

        add_logs("Khởi động hệ thống")
        $(".bot-history-clear").click(function () {
            $("#bot-logs").text('')
        })

        //5m
        isLogin || await refreshToken()
        setInterval(() => refreshToken(), 300000)

        const botVolume = $("#bot-volume")
        const botVolumeValue = $("#bot-volume-value")
        const botAutoOrder = $("#bot-auto-order")
        const sucMua = $("#sucmua-int")
        var sohodong = $("#sohopdong")

        var settings = () => localStorage.getItem("autoBotSettings") && JSON.parse(localStorage.getItem("autoBotSettings"))

        const st = settings()
        if (st) {
            botAutoOrder.attr("checked", st.enable)
            $("#bot-trendTypes").val(st.trendType)
            botVolume.val(st.volume.type)
            botVolumeValue.val(st.volume.value)
        } else {
            botVolumeValue.val(parseInt(sucMua.text()))
            botAutoOrder.attr("checked", false)
        }
        botVolumeValue.attr("max", sucMua.text())

        botVolume.change(function () {
            if ($(this).val() === "0") {
                botVolumeValue.val(parseInt(sucMua.text()))
                if (botAutoOrder.is(":checked")) {
                    sohodong.val(botVolumeValue.val())
                }
            }
        })

        botVolumeValue.on("input", function () {
            let value = $(this).val()
            const max = parseInt($(this).attr('max'))
            if (value > max) {
                $(this).val(max)
            }
            botVolume.val("1")
            if (botAutoOrder.is(":checked")) {
                sohodong.val($(this).val())
            }

            add_logs(botVolume.find(":selected").text() + " " + $(this).val())

            localStorage.setItem("autoBotSettings", JSON.stringify({
                ...settings() ?? botSettings,
                volume: {
                    type: botVolume.val(),
                    value: $(this).val()
                }
            }))
        })

        if (botAutoOrder.is(":checked")) {
            sohodong.val(botVolumeValue.val())
        }

        botAutoOrder.on("change", function () {
            if ($(this).is(":checked")) {
                sohodong.val(botVolumeValue.val())
                add_logs("Đã bật bot hỗ trợ đặt lệnh")
                console.log("Đã bật bot hỗ trợ đặt lệnh");
            }
            else {
                sohodong.val(1)
                if (obs) {
                    obs.disconnect()
                }
                if(obsTheoDoiTrangThaiDat){
                    obsTheoDoiTrangThaiDat.disconnect()
                }
                add_logs("Đã tắt bot hỗ trợ đặt lệnh")
                console.log("Đã tắt bot hỗ trợ đặt lệnh");
            }
            localStorage.setItem("autoBotSettings", JSON.stringify({
                ...settings() ?? botSettings,
                enable: $(this).is(":checked")
            }))
        })

        $("#bot-trendTypes").on("change", function () {
            add_logs("Khi có trend " + $(this).find(":selected").text())
            localStorage.setItem("autoBotSettings", JSON.stringify({
                ...settings() ?? botSettings,
                trendType: $(this).val()
            }))
        })

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

        var giabandau;
        if(isDemo){
            $("#acceptCreateOrder").click(() => {
                if(obsTheoDoiTrangThaiDat || obs){
                    const th = $("#modal_order_type").text()
                    const shd = $("#modal_sohopdong").text()
                    const gd = $("#modal_price").text()

                    obs && obs.disconnect()
                    obsTheoDoiTrangThaiDat && obsTheoDoiTrangThaiDat.disconnect()

                    logHistory(th + " - Lệnh tay", giabandau, gd, shd, false)
                }
            })
        }
        else{
            $("#acceptCreateOrderNew").click(() => {
                if(obsTheoDoiTrangThaiDat || obs){
                    const th = $("#modal_order_type").text()
                    const shd = $("#modal_sohopdong").text()
                    const gd = $("#modal_price").text()

                    obs && obs.disconnect()
                    obsTheoDoiTrangThaiDat && obsTheoDoiTrangThaiDat.disconnect()

                    logHistory(th + " - Lệnh tay", giabandau, gd, shd, false)
                }
            })
        }
        

        const funcTheoDoiSucMua = () => {
            const sucmua = document.getElementById("sucmua-int")
            if (!sucmua) {
                setTimeout(funcTheoDoiSucMua, 1000)
            }
            else {
                const observer = new MutationObserver(function (mutationsList) {
                    for (let mutation of mutationsList) {
                        if (mutation.type === 'characterData' || mutation.type === 'childList') {
                            const newValue = parseInt(mutation.target.textContent) //sucMua.text()

                            botVolumeValue.attr("max", newValue)

                            if(botVolume.val() === "0"){
                                botVolumeValue.val(newValue)
                            }

                            localStorage.setItem("autoBotSettings", JSON.stringify({
                                ...settings() ?? botSettings,
                                volume: {
                                    type: botVolume.val(),
                                    value: botVolumeValue.val()
                                }
                            }))

                        }
                    }
                });
                observer.observe(sucmua, { characterData: true, childList: true, subtree: true });
            }
        }
        funcTheoDoiSucMua()

        const convertFloatToFixed = (value, fix = 1) => parseFloat(parseFloat(value.split(':').pop().trim()).toFixed(fix));

        const divideNumberBy2CeilToArray = (value) => {
            let a = Math.ceil(parseInt(value) / 2)
            let b = value - a
            return [a, b]
        }

        const runBotNormal = (tinhieu, giadat, hopdong) => {
            $('.cancel-all-confirm').css('display', '')
            $('#use_stopOrder').prop('checked', false)

            $('#modal_price').text(giadat)
            objConfig.CONFIRM_ORDER = false
            $("#right_price").val(giadat)

            $("#sohopdong").val(hopdong)

            tinhieu === "LONG" ? $('input[name="type"]').val("B") : $('input[name="type"]').val("S")
            
            isDemo
                ? saveOrder()
                : saveOrderNew()
                
            add_logs(`Đã đặt lệnh ${tinhieu} giá ${giadat} với ${hopdong} hợp đồng`)
        }

        const runBotStopOrder = (tinhieu, hopdong, stopOrderValue) => {
            $("#right_price").val("MTL")
            $("#sohopdong").val(hopdong)
            tinhieu === "LONG" ? $('input[name="type"]').val("B") : $('input[name="type"]').val("S")

            if (isDemo) {
                plusDivs(1)
                $('.cancel-all-confirm').css('display', '')
                $('#use_stopOrder').prop('checked', true)
                tinhieu === "LONG" ? $('#selStopOrderType').val("SOL") : $("#selStopOrderType").val("SOU")
                $('#soIndex').val(stopOrderValue)

                saveOrder()

                plusDivs(-1)
                $('#use_stopOrder').prop('checked', false)
            }
            else {
                changeSelectionType($("#select_condition_order_wrapper"))
                changeSelectOrder($('#select_order_type').children().eq(1)[0])

                $('#modal_price').text("MTL")
                objConfig.CONFIRM_ORDER = false

                $("#right_order_type").data("2")
                $("#right_stock_cd_code").data("3")

                tinhieu === "LONG" ? $('#right_selStopOrderType').val("SOL") : $("#right_selStopOrderType").val("SOU")

                $('#right_stopOrderIndex').val(stopOrderValue)

                saveOrderNew()

                changeSelectionType($("#select_normal_order_wrapper"))
            }
            add_logs(`Đã đặt lệnh ${tinhieu} Stop Order: ${stopOrderValue}, MTL với ${hopdong} hợp đồng`)
        }

        const huyLenhThuong = () => {
            $('.cancel-all-confirm').css('display', 'none')

            isDemo
                ? saveOrder()
                : saveOrderNew()

            $('.cancel-all-confirm').css('display', '')
            add_logs("Đã hủy tất cả lệnh thường")
        }

        const huyLenhDieuKien = () => {
            if (isDemo) {
                objOrderPanel.create = 0;
                objOrderPanel.showConditionOrderList()
                setTimeout(() => {
                    $("#tbodyContentCondition tr").each(function () {
                        const link = $(this).find('a[id^="btne_"]');
                        if (link.length > 0) {
                            const orderNo = $(this).children().eq(0).attr('id').split('_')[1]
                            $("#order_del_no_conf").val(orderNo)
                            cancelOrder("advance")
                        }
                    })
                }, 700)
            }
            else {
                $("#modal_stock_cd_cancel_all").val("ALL")
                $("#modal_account_cancel_all").val($("#right_account option:selected").val())
                $('#cancel_order_type').val("order_condition")
                cancelAllOrderPending()
            }
            add_logs("Đã hủy tất cả lệnh điều kiện chờ kích hoạt")
        }

        const huyViTheHienTai = () => {
            const vithe = parseInt($("#status-danhmuc-content").children().eq(0).children().eq(1).text())
            if (vithe) {
                vithe > 0
                    ? runBotNormal("SHORT", "MTL", Math.abs(vithe))
                    : runBotNormal("LONG", "MTL", Math.abs(vithe))
            }
        }

        const capNhatSoHopDong = () => {
            const li = ulPanel.children()
            li.eq(0).children().click()
            //li.eq(2).children().click()
        }

        const daoLenh = (tinhieu) => tinhieu === "LONG" ? "SHORT" : "LONG"

        const capNhatDanhSachLenh = () => {
            $('#hdnPageCurrentIntime').val(1)
            $('input[name=statusFilter]:checked').val('');
            objOrderPanel.showOrderList()
        }

        const botAutoClick = (arr, fullHopdong = parseInt(botVolumeValue.val()), isAdmin = false) => {
            let tinhieu = arr[1].includes("Tin hieu long: Manh") ? "LONG" : "SHORT"

            add_logs("Tính hiệu: " + tinhieu)

            obsTheoDoiTrangThaiDat && obsTheoDoiTrangThaiDat.disconnect()

            let dadatTp1 = false
            let dadatTp2 = false
            let daHuyInitCancel = false
            let daHuyTp1Cancel = false

            const type = arr[arr.length - 1].split(" ")
            const daoChieu = arr[arr.length - 1] === "REVERSE" || type[0] === "REVERSE"

            const vithe = $("#status-danhmuc-content").children().eq(0).children().eq(1).text()

            let my_hd = fullHopdong
            const ngDat = parseInt(botVolumeValue.val())

            if(daoChieu){
                add_logs("Tín hiệu đảo chiều!")

                if(order25[1] > 0) {
                    runBotStopOrder(tinhieu, order25[1], catLo)
                }
                const soViThe = parseInt(vithe)
                const soSucMua = parseInt(sucMua.text())

                if (botVolume.val() === "0") {
                    if (soViThe && !soSucMua) {
                        if(isAdmin){
                            if (Math.abs(soViThe) >= fullHopdong) {    
                                fullHopdong += Math.abs(soViThe)
                            }
                            else {
                                my_hd = Math.abs(soViThe)
                                fullHopdong = Math.abs(soViThe) * 2
                            }
                        }
                        else{
                            my_hd = Math.abs(soViThe) 
                            fullHopdong = Math.abs(soViThe) * 2
                        }
                    }
                    else if (!soViThe && soSucMua) {
                        if(isAdmin){
                            if (fullHopdong > ngDat) {
                                my_hd = ngDat
                                fullHopdong = ngDat
                            }
                        }
                        else{
                            my_hd = ngDat
                            fullHopdong = ngDat
                        }
                    }
                    else if (soViThe && soSucMua) {
                        if(isAdmin){
                            if ((Math.abs(soViThe) + ngDat) < fullHopdong) {
                                my_hd = (Math.abs(soViThe) + ngDat)
                                fullHopdong = Math.abs(soViThe) * 2 + ngDat // hoac (Math.abs(soViThe) + botVolumeValue.val()) + Math.abs(soViThe)
                            }
                            else {
                                my_hd = fullHopdong
                                fullHopdong += Math.abs(soViThe)
                            }
                        }
                        else{
                            my_hd = (Math.abs(soViThe) + ngDat)
                            fullHopdong = Math.abs(soViThe) * 2 + ngDat
                        }
                    }
                }
                else {
                    if (soViThe && !soSucMua) {
                        if(isAdmin){
                            if (Math.abs(soViThe) >= fullHopdong) {
                                fullHopdong += Math.abs(soViThe)
                            }
                            else {
                                my_hd = Math.abs(soViThe)
                                fullHopdong = Math.abs(soViThe) * 2
                            }
                        }
                        else{
                            my_hd = Math.abs(soViThe)
                            fullHopdong += Math.abs(soViThe)
                        }
                    }
                    else if (!soViThe && soSucMua) {
                        if(isAdmin){
                            if (fullHopdong > ngDat) {
                                my_hd = ngDat
                                fullHopdong = ngDat
                            }
                        }
                        else{
                            my_hd = ngDat
                            fullHopdong = ngDat
                        }
                    }
                    else if (soViThe && soSucMua) {
                        if(isAdmin){
                            if (fullHopdong > ngDat) {
                                my_hd = ngDat
                                fullHopdong = ngDat + Math.abs(soViThe)
                            }
                            else {
                                fullHopdong += Math.abs(soViThe)
                            }
                        }
                        else{
                            my_hd = ngDat
                            fullHopdong = ngDat + Math.abs(soViThe)
                        }
                    }
                }

                huyLenhThuong()
                huyLenhDieuKien()
            }
            else {
                if(isAdmin){
                    if (fullHopdong > ngDat) {
                        my_hd = ngDat
                        fullHopdong = ngDat
                    } 
                }
                else {
                    my_hd = ngDat
                    fullHopdong = ngDat
                }
            }

            let giamua = convertFloatToFixed(arr[2])
            let catLo = convertFloatToFixed(arr[7])

            if(!isAdmin){
                tinhieu === "LONG"
                    ? giamua += 0.2
                    : giamua -= 0.2
            }
            giamua = giamua.toFixed(1)
            catLo = catLo.toFixed(1)

            const tp1 = convertFloatToFixed(arr[3])
            const tp2 = convertFloatToFixed(arr[4])
            
            const order50 = divideNumberBy2CeilToArray(my_hd)
            const order25 = divideNumberBy2CeilToArray(order50[1])

            const trendType = $("#bot-trendTypes").val()
            if (((trendType == "1" && tinhieu == "LONG") || (trendType == "2" && tinhieu == "SHORT") || trendType == "0")
                && fullHopdong > 0) {
                runBotNormal(tinhieu, giamua, fullHopdong)

                const funcNangTP = () => {
                    logHistory(tinhieu, giamua, giamua, my_hd, false)
                    giabandau = giamua

                    //dao lenh
                    tinhieu = daoLenh(tinhieu)
                    runBotStopOrder(tinhieu, fullHopdong, catLo)

                    //Chot 50%
                    if (order50[0] > 0) {
                        runBotNormal(tinhieu, tp1, order50[0])
                    }

                    //Chot 25%
                    if (order25[0] > 0) {
                        runBotNormal(tinhieu, tp2, order25[0])
                    }

                    const funcTheoDoiGiaKhopLenh = () => {
                        const nodeGiaKhop = document.getElementById("tbodyPhaisinhContent").children[0]?.children[10]
                        if (!nodeGiaKhop) {
                            setTimeout(funcTheoDoiGiaKhopLenh, 1000)
                        }
                        else {
                            obs && obs.disconnect()
                            
                            obs = new MutationObserver(function (mutationsList) {
                                for (let mutation of mutationsList) {
                                    if (mutation.type === 'characterData' || mutation.type === 'childList') {
                                        const giaKhopLenh = parseFloat(mutation.target.textContent)
                                        
                                        if (isNaN(giaKhopLenh)) continue;

                                        const isShort = tinhieu === "SHORT"

                                        const condition1 = isShort
                                            ? giaKhopLenh >= tp1 && giaKhopLenh < tp2
                                            : giaKhopLenh <= tp1 && giaKhopLenh > tp2

                                        const condition2 = isShort
                                            ? giaKhopLenh >= tp2
                                            : giaKhopLenh <= tp2

                                        const lenhBanDau = daoLenh(tinhieu)
                                        
                                        //tp
                                        if (condition1 && !dadatTp1 && order50[0] > 0) {
                                            huyLenhDieuKien()

                                            isDemo
                                                ? setTimeout(() => runBotStopOrder(tinhieu, order50[0], giamua), 1000)
                                                : runBotStopOrder(tinhieu, order50[0], giamua)

                                            dadatTp1 = true
                                            logHistory(lenhBanDau, giamua, tp1, order50[0], false)
                                        }
                                        else if (condition2 && !dadatTp2 && order25[0] > 0) {
                                            huyLenhDieuKien()

                                            isDemo
                                                ? setTimeout(() => runBotStopOrder(tinhieu, order25[0], tp1), 1000)
                                                : runBotStopOrder(tinhieu, order25[0], tp1)

                                            dadatTp1 = true
                                            dadatTp2 = true
                                            logHistory(lenhBanDau, tp1, tp2, order25[0], false)
                                        }

                                        //sl
                                        const initCancelCondition = isShort
                                            ? giaKhopLenh <= catLo && !dadatTp1 && !dadatTp2
                                            : giaKhopLenh >= catLo && !dadatTp1 && !dadatTp2

                                        const tp1Condition = isShort
                                            ? giaKhopLenh <= giamua && dadatTp1 && !dadatTp2
                                            : giaKhopLenh >= giamua && dadatTp1 && !dadatTp2

                                        if (initCancelCondition && !daHuyInitCancel) {
                                            huyLenhThuong()

                                            daHuyInitCancel = true
                                            logHistory(lenhBanDau, giamua, catLo, my_hd, true)
                                        }
                                        else if (tp1Condition && !daHuyTp1Cancel) {
                                            huyLenhThuong()

                                            daHuyInitCancel = true
                                            daHuyTp1Cancel = true
                                            logHistory(lenhBanDau, giamua, tp1, (my_hd - parseInt(order50[0])), true)
                                        }
                                    }
                                }
                            });
                            
                            obs.observe(nodeGiaKhop, { characterData: true, childList: true, subtree: true })
                        }
                    }
                    funcTheoDoiGiaKhopLenh()
                }

                const funcTheoDoiTrangThaiDat = () => {
                    let lenhFullHd
                    if(isDemo){
                        lenhFullHd = document.getElementById("tbodyContent").children[0].children[9]
                    }
                    else lenhFullHd = document.getElementById("tbodyContent").children[0].children[10]

                    if(!lenhFullHd){
                        setTimeout(funcTheoDoiTrangThaiDat, 1000)
                    }
                    else{
                        const trangthaiBanDau = lenhFullHd.textContent.trim()
                        if (trangthaiBanDau == 'Đã khớp') {
                            funcNangTP()
                        }
                        else {
                            let dslenhInterval = setInterval(capNhatDanhSachLenh, 1000)
                            setTimeout(() => {
                                clearInterval(dslenhInterval)
                                if(lenhFullHd.textContent.trim() == 'Chờ khớp'){
                                    obsTheoDoiTrangThaiDat && obsTheoDoiTrangThaiDat.disconnect()
                                    huyLenhThuong()
                                }
                            }, 30000)

                            obsTheoDoiTrangThaiDat = new MutationObserver(function (mutationsList, obsThis) {
                                for (let mutation of mutationsList) {
                                    if (mutation.type === 'characterData' || mutation.type === 'childList') {
                                        const trangthai = mutation.target.textContent

                                        // || trangthai == 'Khớp 1 phần' || trangthai == 'Khớp một phần'
                                        if(trangthai == 'Đã khớp'){
                                            funcNangTP()
                                            obsThis.disconnect()
                                            clearInterval(dslenhInterval)
                                        }
                                    }
                                }
                            });
                            obsTheoDoiTrangThaiDat.observe(lenhFullHd, { characterData: true, childList: true, subtree: true });
                            capNhatDanhSachLenh()
                        }
                    }
                }
                capNhatDanhSachLenh()
                setTimeout(funcTheoDoiTrangThaiDat, 1200)
            }
        }
        
        var connection = new signalR.HubConnectionBuilder()
            .withUrl(`${baseURL}/realtimeSignal`, {
                accessTokenFactory: () => getAccessToken()
            })
            .configureLogging(signalR.LogLevel.None)
            .withAutomaticReconnect()
            .build()

        connection.on("Signal", function (message) {
            const tinhieu = message.split("\n").map(line => line.trim())
            showTinHieu(tinhieu)

            if (botAutoOrder.is(":checked")) {
                capNhatSoHopDong()
                botAutoClick(tinhieu)
            }
        })

        connection.on("ServerMessage", function (message) {
            if (message == "LOGOUT") {
                obs && obs.disconnect()
                obsTheoDoiTrangThaiDat && obsTheoDoiTrangThaiDat.disconnect()
                connection.stop()
                add_logs("Tài khoản đã đăng nhập từ trình duyệt khác, bạn sẽ bị đăng xuất.")
                setTimeout(server_logout, 1000)
            }
        })

        connection.on("AdminSignal", function (message) {
            if (botAutoOrder.is(":checked")) {
                capNhatSoHopDong()
                if (message == "CANCEL_ALL") {
                    add_logs("Admin: Hủy tất cả lệnh" )
                    huyLenhThuong()
                    huyLenhDieuKien()
                    obs && obs.disconnect()
                    obsTheoDoiTrangThaiDat && obsTheoDoiTrangThaiDat.disconnect()
                }
                else if (message == "CANCEL_VITHE") {
                    add_logs("Admin: Hủy vị thế hiện tại")
                    huyViTheHienTai()
                    obs && obs.disconnect()
                    obsTheoDoiTrangThaiDat && obsTheoDoiTrangThaiDat.disconnect()
                }
                else if(message.includes("STOP_ORDER_ONLY")){
                    const arr = message.split("\n").map(line => line.trim())
                    const tinhieu = arr[1].toUpperCase()
                    let sohd = parseInt(arr[2])
                    const sl = parseFloat(arr[3]).toFixed(1)

                    if(sohd > botVolumeValue.val()){
                        sohd = botVolumeValue.val()
                    }

                    runBotStopOrder(tinhieu, sohd, sl)
                }
                else {
                    const arr = message.split("\n").map(line => line.trim())
                    showTinHieu(arr)
                    const type = arr[arr.length - 1].split(" ")

                    let hopdong = botVolumeValue.val()

                    if ((type[1] || type[2]) && (parseInt(type[1]) > 0 || parseInt(type[2]) > 0)) {
                        let hd = parseInt(type[1]) || parseInt(type[2])
                        hopdong = hd
                    }

                    if (type[0] === "NO_STOP_ORDER" || type[1] === "NO_STOP_ORDER") {
                        const tinhieu = arr[1].toUpperCase() === "TIN HIEU LONG: MANH" ? "LONG" : "SHORT"

                        let giamua = convertFloatToFixed(arr[2])
                        tinhieu === "LONG"
                            ? giamua += 0.2
                            : giamua -= 0.2
                        giamua = giamua.toFixed(1)

                        runBotNormal(tinhieu, giamua, hopdong)
                    }
                    else {
                        botAutoClick(arr, hopdong, true)
                    }
                }
            }
        })

        await connection.start().then(() => {
            add_logs("Đã kết nối với tín hiệu bot")
            console.log(`[${new Date().toISOString()}] Connected`)
        }).catch((err) => console.error(err))

        $('a[data-original-title="Logout"]').click(function () {
            connection.stop()
        })

        add_logs("Hệ thống sẳn sàng")
    }


    if (getCurrentUser() && getCookie("USER")) {
        loggingAndBot()
    }
    else {
        $('#cb_showPassword').on('change', function () {
            const showPassword = $(this).is(':checked');
            $('#cb_password').attr('type', showPassword ? 'text' : 'password');
        });
        $('#cb_login').click(function () {
            const $statusElement = $('#cb_loginStatus');
            try {
                $statusElement.text('').removeClass('alert-danger alert-info');

                const username = $('#cb_username').val();
                if (!username) {
                    throw new Error("Vui lòng nhập tên đăng nhập");
                }
                const password = $('#cb_password').val();
                if (!password) {
                    throw new Error("Mật khẩu không được để trống");
                }
                $statusElement.removeClass('alert-danger').addClass('alert-info').text('Đang đăng nhập...');
                $(this).attr("disabled", true)

                const data = JSON.stringify({ username, password });
                $.ajax({
                    url: api_auth + "/login",
                    method: "POST",
                    data: data
                }).done((data) => {
                    if (data.access_token) {
                        setCookie("auth_token", data.access_token, 5);
                        delete data.access_token
                        setCookie("bot_data", JSON.stringify(data), 1 * 24 * 60)
                        loggingAndBot("login")
                    } else $statusElement.text(data.error).removeClass('alert-info').addClass('alert-danger')
                }).fail((e, error) => {
                    error === 'timeout'
                        ? $statusElement.text("Mạng yếu, vui lòng thử lại.").removeClass('alert-info').addClass('alert-danger')
                        : $statusElement.text(e.responseText ?? "Có lỗi xảy ra").removeClass('alert-info').addClass('alert-danger')
                    $(this).attr("disabled", false)
                })
            } catch (error) {
                $statusElement.text(error.message ?? "Có lỗi xảy ra").removeClass('alert-info').addClass('alert-danger');
                $(this).attr("disabled", false)
            }
        });
    }
})