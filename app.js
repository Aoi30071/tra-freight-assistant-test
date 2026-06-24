// 【新增】車班切換連動功能
window.switchCrewVersion = function(crewKey) {
    const crewData = window.allCrewDatabases[crewKey];
    if (!crewData) return;

    // 重新指派全域的車站資料大表
    window.freightDatabase = crewData.database;
    window.defaultStationOrder = crewData.order;

    // 如果切換到嘉義版，強制隱藏並重設山海線直達開關；彰化版則交給掃描器自動判斷
    const selectorDiv = document.getElementById('directRouteSelector');
    if (selectorDiv) {
        selectorDiv.style.display = 'none';
        setDirectRoute('sea');
    }

    // 將所有現存卡片的選單全面重新整理與洗牌
    const cards = document.querySelectorAll('.station-card');
    cards.forEach((card, index) => {
        const select = card.querySelector('.st-name');
        if (select) select.value = ""; // 清空選定值避免跨車班出錯
        renderSmartOptions(card, index);
    });

    refreshStationLabels();
    checkDirectRouteVisibility();
}

// 方案 B：直達車開關視覺切換（手動點擊時使用）
window.setDirectRoute = function(route) {
    const btnSea = document.getElementById('toggleSea');
    const btnMtn = document.getElementById('toggleMountain');
    const inputRoute = document.getElementById('currentDirectRoute');
    if (!btnSea || !btnMtn || !inputRoute) return;
    
    if (route === 'sea') {
        btnSea.style.background = '#1a5cff';
        btnSea.style.color = 'white';
        btnMtn.style.background = '#eeeeee';
        btnMtn.style.color = '#333';
        inputRoute.value = 'sea';
    } else {
        btnSea.style.background = '#eeeeee';
        btnSea.style.color = '#333';
        btnMtn.style.background = '#dc3545';
        btnMtn.style.color = 'white';
        inputRoute.value = 'mountain';
    }
}

// 💡 智慧方向定位自動掃描器（已徹底解開無窮迴圈死結）
function checkDirectRouteVisibility() {
    const crewKey = document.getElementById('crewSelector').value;
    const crewData = window.allCrewDatabases[crewKey];
    const selectorDiv = document.getElementById('directRouteSelector');
    const titleSpan = document.getElementById('directRouteTitle');
    const btnSea = document.getElementById('toggleSea');
    const btnMtn = document.getElementById('toggleMountain');
    const currentInput = document.getElementById('currentDirectRoute');
    if (!selectorDiv) return;

    // 防呆：如果目前車班不支援山海線切換（例如嘉義車班），直接封鎖並隱藏
    if (!crewData || crewData.hasDirectRouteToggle === false) {
        selectorDiv.style.display = 'none';
        if (currentInput) currentInput.value = 'sea';
        return;
    }

    const names = document.querySelectorAll('.st-name');
    if (names.length >= 2) {
        for (let i = 0; i < names.length - 1; i++) {
            const st1 = names[i].value;
            const st2 = names[i+1].value;
            
            if (st1 && st2) {
                const isNorthSide = (st1 === "新竹貨" || st1 === "新竹" || st1 === "竹南" || st2 === "新竹貨" || st2 === "新竹" || st2 === "竹南");
                const isSouthSide = (st1 === "彰化" || st1 === "員林" || st1 === "社頭" || st1 === "田中" || st1 === "二水" || st1 === "林內" || st1 === "斗六" || st1 === "斗南" || st1 === "大林" || st1 === "民雄" || st1 === "嘉義" || st2 === "彰化" || st2 === "員林" || st2 === "社頭" || st2 === "田中" || st2 === "二水" || st2 === "林內" || st2 === "斗六" || st2 === "斗南" || st2 === "大林" || st2 === "民雄" || st2 === "嘉義");
                
                const s1 = freightDatabase[st1];
                const s2 = freightDatabase[st2];

                if (s1 && s2) {
                    // 🟢 情境 A：直達車流派（如 新竹貨 ⇄ 二水）
                    if (isNorthSide && isSouthSide) {
                        const directionText = (s1.km > s2.km) ? "【北上】" : "【南下】";
                        if (titleSpan) titleSpan.innerText = `🧭 運轉調度：偵測到區間包含 ${directionText} 直達路段 (${st1} ➔ ${st2})`;
                        if (btnSea) btnSea.innerHTML = "🌊 經由海線";
                        if (btnMtn) btnMtn.innerHTML = "⛰️ 經由山線";
                        selectorDiv.style.display = 'block'; 
                        return;
                    } 
                    // 🟡 情境 B：交叉跨線車流派（如 三義 ⇄ 沙鹿、沙鹿 ⇄ 新竹貨）
                    else if ((s1.sea_km !== undefined) !== (s2.sea_km !== undefined)) {
                        const isHubIntersection = (st1 === "彰化" || st1 === "竹南" || st2 === "彰化" || st2 === "竹南");
                        const theOtherStation = (st1 === "彰化" || st1 === "竹南") ? s2 : s1;
                        
                        if (isHubIntersection && (theOtherStation.line === "山線" || theOtherStation.line === "幹線")) {
                            // 繼續往後巡邏
                        } else {
                            if (titleSpan) titleSpan.innerText = "⚠️ 請確認經由樞紐：";
                            if (btnSea) btnSea.innerHTML = "🚂 經由彰化";
                            if (btnMtn) btnMtn.innerHTML = "🚂 經由竹南";
                            
                            // 🔍 【純外觀安全轉轍】：直接改樣式，絕對不呼叫 setDirectRoute 避免死迴圈
                            const seaObj = (s1.sea_km !== undefined) ? s1 : s2;
                            const trunkObj = (s1.sea_km === undefined) ? s1 : s2;
                            const isHeadingNorth = (trunkObj.km < 160); 

                            if (currentInput && btnSea && btnMtn) {
                                if (isHeadingNorth) {
                                    // 北上自動靠右（經竹南）
                                    btnSea.style.background = '#eeeeee';
                                    btnSea.style.color = '#333';
                                    btnMtn.style.background = '#dc3545'; // 紅色高亮
                                    btnMtn.style.color = 'white';
                                    currentInput.value = 'mountain';
                                } else {
                                    // 南下自動靠左（經彰化）
                                    btnSea.style.background = '#1a5cff'; // 藍色高亮
                                    btnSea.style.color = 'white';
                                    btnMtn.style.background = '#eeeeee';
                                    btnMtn.style.color = '#333';
                                    currentInput.value = 'sea';
                                }
                            }

                            selectorDiv.style.display = 'block'; 
                            return;
                        }
                    }
                }
            }
        }
    }
    // 🔴 情境 C：其餘常規情況，立刻隱藏清除
    selectorDiv.style.display = 'none';
    if (currentInput && btnSea && btnMtn) {
        btnSea.style.background = '#1a5cff';
        btnSea.style.color = 'white';
        btnMtn.style.background = '#eeeeee';
        btnMtn.style.color = '#333';
        currentInput.value = 'sea';
    }
}

// 日期選擇器初始化
function setupSmartDatePicker() {
    const ySelect = document.getElementById('dateYear');
    const mSelect = document.getElementById('dateMonth');
    const dSelect = document.getElementById('dateDay');
    if (!ySelect || !mSelect || !dSelect) return;

    const today = new Date();
    const currentTaiwanYear = today.getFullYear() - 1911; 
    const currentMonth = today.getMonth() + 1; 
    const currentDay = today.getDate();

    let yHtml = '';
    for (let y = currentTaiwanYear - 2; y <= currentTaiwanYear + 2; y++) {
        yHtml += `<option value="${y}">${y}</option>`;
    }
    ySelect.innerHTML = yHtml;
    ySelect.value = currentTaiwanYear;

    let mHtml = '';
    for (let m = 1; m <= 12; m++) {
        let mText = m < 10 ? '0' + m : m;
        mHtml += `<option value="${mText}">${mText}</option>`;
    }
    mSelect.innerHTML = mHtml;
    mSelect.value = currentMonth < 10 ? '0' + currentMonth : currentMonth;

    let dHtml = '';
    for (let d = 1; d <= 31; d++) {
        let dText = d < 10 ? '0' + d : d;
        dHtml += `<option value="${dText}">${dText}</option>`;
    }
    dSelect.innerHTML = dHtml;
    dSelect.value = currentDay < 10 ? '0' + currentDay : currentDay;
}

function getFormattedDateString() {
    const y = document.getElementById('dateYear').value;
    const m = document.getElementById('dateMonth').value;
    const d = document.getElementById('dateDay').value;
    return `${y}/${m}/${d}`; 
}

// 修正：補上之前遺漏的關鍵輔助函式
function getOptionText(key) {
    const info = freightDatabase[key];
    if (info && info.line === "幹線") return `${key}`;
    return info ? `${key} (${info.line})` : `${key}`;
}

function getTrainDirectionType() {
    const trainInput = document.getElementById('trainNo');
    if (!trainInput) return 'even'; 
    const trainNoStr = trainInput.value ? trainInput.value.trim() : '';
    if (!trainNoStr) return 'even';
    const lastChar = trainNoStr.slice(-1);
    const num = parseInt(lastChar);
    if (isNaN(num)) return 'even';
    return (num % 2 === 0) ? 'even' : 'odd';
}

function detectTrainRouteHistory() {
    const selects = document.querySelectorAll('.st-name');
    let hasSelectedMountain = false;
    let hasSelectedSea = false;

    for (let i = 0; i < selects.length; i++) {
        const val = selects[i].value;
        if (val && freightDatabase[val]) {
            if (freightDatabase[val].line === "山線") hasSelectedMountain = true;
            if (freightDatabase[val].line === "海線") hasSelectedSea = true;
        }
    }
    if (hasSelectedMountain) return "山線專用";
    if (hasSelectedSea) return "海線專用";
    return "尚未定錨";
}

// 智慧推薦選單
function renderSmartOptions(cardElement, index) {
    const select = cardElement.querySelector('.st-name');
    if (!select) return;
    const isUnlocked = cardElement.getAttribute('data-unlocked') === 'true';
    const currentVal = select.value;

    if (isUnlocked) {
        let html = '<option value="">--自由任選全車站--</option>';
        defaultStationOrder.forEach(key => {
            html += `<option value="${key}">${getOptionText(key)}</option>`;
        });
        select.innerHTML = html;
        select.value = currentVal;
        return;
    }

    if (index === 0) {
        let html = '<option value="">--請選擇發站--</option>';
        defaultStationOrder.forEach(key => {
            html += `<option value="${key}">${getOptionText(key)}</option>`;
        });
        select.innerHTML = html;
        select.value = currentVal;
    } else {
        const allCards = document.querySelectorAll('.station-card');
        if (allCards[index - 1]) {
            const prevSelect = allCards[index - 1].querySelector('.st-name');
            const prevName = prevSelect ? prevSelect.value : "";
            const prevInfo = freightDatabase[prevName];
            const dirType = getTrainDirectionType();
            const prevIdx = defaultStationOrder.indexOf(prevName);
            const currentRouteMode = detectTrainRouteHistory();

            let html = '<option value="">--請選擇車站--</option>';

            if (!prevName) {
                html = '<option value="">請先選擇前一站</option>';
            } else if (prevName === "二水") {
                if (dirType === 'odd') {
                    html += `<optgroup label="🧭 停靠站推薦：二水出發南下">`;
                    html += `<option value="中興支線">中興支線 (支線)</option>`;
                    html += `<option value="源泉">源泉 (集集線)</option>`;
                    for (let i = prevIdx + 1; i < defaultStationOrder.length; i++) {
                        const key = defaultStationOrder[i];
                        if (freightDatabase[key] && freightDatabase[key].line !== "集集線" && freightDatabase[key].line !== "專線" && key !== "中興支線") {
                            html += `<option value="${key}">${getOptionText(key)}</option>`;
                        }
                    }
                    html += `</optgroup><optgroup label="其餘北上車站">`;
                    for (let i = prevIdx - 1; i >= 0; i--) {
                        const key = defaultStationOrder[i];
                        if (freightDatabase[key] && freightDatabase[key].line !== "集集線" && freightDatabase[key].line !== "專線" && key !== "中興支線") {
                            html += `<option value="${key}">${getOptionText(key)}</option>`;
                        }
                    }
                    html += `</optgroup>`;
                } else {
                    html += `<optgroup label="🧭 停靠站推薦：二水出發北上">`;
                    html += `<option value="中興支線">中興支線 (支線)</option>`;
                    html += `<option value="源泉">源泉 (集集線)</option>`;
                    for (let i = prevIdx - 1; i >= 0; i--) {
                        const key = defaultStationOrder[i];
                        if (freightDatabase[key] && freightDatabase[key].line !== "集集線" && freightDatabase[key].line !== "專線" && key !== "中興支線") {
                            html += `<option value="${key}">${getOptionText(key)}</option>`;
                        }
                    }
                    html += `</optgroup><optgroup label="其餘南下車站">`;
                    for (let i = prevIdx + 1; i < defaultStationOrder.length; i++) {
                        const key = defaultStationOrder[i];
                        if (freightDatabase[key] && freightDatabase[key].line !== "集集線" && freightDatabase[key].line !== "專線" && key !== "中興支線") {
                            html += `<option value="${key}">${getOptionText(key)}</option>`;
                        }
                    }
                    html += `</optgroup>`;
                }
            } else if (prevName === "臺中港") {
                if (dirType === 'odd') {
                    html += `<optgroup label="🧭 停靠站推薦：臺中港出發南下/進入港區">`;
                    html += `<option value="中港區">中港區 (專線) ⭐</option>`;
                    for (let i = prevIdx + 1; i < defaultStationOrder.length; i++) {
                        const key = defaultStationOrder[i];
                        if (freightDatabase[key] && (freightDatabase[key].line === "海線" || freightDatabase[key].line === "幹線") && key !== "臺中港") {
                            html += `<option value="${key}">${getOptionText(key)}</option>`;
                        }
                    }
                    html += `</optgroup><optgroup label="其餘北上車站">`;
                    for (let i = prevIdx - 1; i >= 0; i--) {
                        const key = defaultStationOrder[i];
                        if (freightDatabase[key] && (freightDatabase[key].line === "海線" || freightDatabase[key].line === "幹線") && key !== "臺中港" && key !== "中港區") {
                            html += `<option value="${key}">${getOptionText(key)}</option>`;
                        }
                    }
                    html += `</optgroup>`;
                } else {
                    html += `<optgroup label="🧭 停靠站推薦：臺中港出發北上">`;
                    for (let i = prevIdx - 1; i >= 0; i--) {
                        const key = defaultStationOrder[i];
                        if (freightDatabase[key] && (freightDatabase[key].line === "海線" || freightDatabase[key].line === "幹線") && key !== "臺中港") {
                            html += `<option value="${key}">${getOptionText(key)}</option>`;
                        }
                    }
                    html += `</optgroup><optgroup label="其餘南下車站">`;
                    for (let i = prevIdx + 1; i < defaultStationOrder.length; i++) {
                        const key = defaultStationOrder[i];
                        if (freightDatabase[key] && (freightDatabase[key].line === "海線" || freightDatabase[key].line === "幹線") && key !== "臺中港" && key !== "中港區") {
                            html += `<option value="${key}">${getOptionText(key)}</option>`;
                        }
                    }
                    html += `</optgroup>`;
                }
            } else if (prevInfo && (prevInfo.line === "集集線" || prevName === "中興支線")) {
                if (dirType === 'odd') {
                    html += `<optgroup label="🧭 停靠站推薦：往支線內南下/深入">`;
                    defaultStationOrder.forEach(key => {
                        const info = freightDatabase[key];
                        if (info && (info.line === "集集線" || key === "中興支線") && key !== prevName) {
                            if (defaultStationOrder.indexOf(key) > defaultStationOrder.indexOf(prevName)) {
                                html += `<option value="${key}">${key}</option>`;
                            }
                        }
                    });
                    html += `</optgroup><optgroup label="其餘車站">`;
                    defaultStationOrder.forEach(key => { if (key !== prevName) html += `<option value="${key}">${getOptionText(key)}</option>`; });
                    select.innerHTML = html;
                    select.value = currentVal;
                    return;
                } else {
                    html += `<optgroup label="🧭 停靠站推薦：由支線內北上/往二水">`;
                    html += `<option value="二水">二水 (幹線) ⭐</option>`;
                    defaultStationOrder.forEach(key => {
                        const info = freightDatabase[key];
                        if (info && (info.line === "集集線" || key === "中興支線") && key !== prevName) {
                            if (defaultStationOrder.indexOf(key) < defaultStationOrder.indexOf(prevName)) {
                                html += `<option value="${key}">${key}</option>`;
                            }
                        }
                    });
                    html += `</optgroup><optgroup label="其餘車站">`;
                    defaultStationOrder.forEach(key => { if (key !== prevName) html += `<option value="${key}">${getOptionText(key)}</option>`; });
                    html += `</optgroup>`;
                }
            } else if (prevName === "中港區") {
                html += `<optgroup label="🧭 停靠站推薦：中港區出專線">`;
                html += `<option value="臺中港">臺中港 (海線) ⭐</option>`;
                html += `</optgroup><optgroup label="其餘幹線車站">`;
                defaultStationOrder.forEach(key => { if (key !== "臺中港" && key !== "中港區") html += `<option value="${key}">${getOptionText(key)}</option>`; });
                html += `</optgroup>`;
            } else {
                const labelDirection = (dirType === 'even') ? "北上方向" : "南下方向";
                html += `<optgroup label="🧭 運行推薦：${labelDirection}">`;
                
                if (dirType === 'even') {
                    for (let i = prevIdx - 1; i >= 0; i--) {
                        const key = defaultStationOrder[i];
                        const info = freightDatabase[key];
                        if (info && info.line !== "集集線" && info.line !== "專線" && key !== "中興支線") {
                            if (key !== "彰化" && key !== "竹南" && info.line === "幹線") { /* 幹線放行 */ } 
                            else {
                                if (currentRouteMode === "山線專用" && info.line === "海線") continue;
                                if (currentRouteMode === "海線專用" && info.line === "山線") continue;
                            }
                            html += `<option value="${key}">${getOptionText(key)}</option>`;
                        }
                    }
                } else {
                    for (let i = prevIdx + 1; i < defaultStationOrder.length; i++) {
                        const key = defaultStationOrder[i];
                        const info = freightDatabase[key];
                        if (info && info.line !== "集集線" && info.line !== "專線" && key !== "中興支線") {
                            if (key !== "彰化" && key !== "竹南" && info.line === "幹線") { /* 幹線放行 */ } 
                            else {
                                if (currentRouteMode === "山線專用" && info.line === "海線") continue;
                                if (currentRouteMode === "海線專用" && info.line === "山線") continue;
                            }
                            html += `<option value="${key}">${getOptionText(key)}</option>`;
                        }
                    }
                }
                html += `</optgroup>`;
            }
            select.innerHTML = html;
            select.value = currentVal;
        }
    }
}

function updateFollowStations(startIndex) {
    const allCards = document.querySelectorAll('.station-card');
    for (let i = startIndex + 1; i < allCards.length; i++) {
        renderSmartOptions(allCards[i], i);
    }
}

function refreshStationLabels() {
    const cards = document.querySelectorAll('.station-card');
    cards.forEach((card, index) => {
        renderSmartOptions(card, index);
        const currentNum = index + 1;
        const labelSpan = card.querySelector('.station-label');
        if (labelSpan) labelSpan.innerText = `第 ${currentNum} 站`;
        const actionArea = card.querySelector('.station-action');
        if (actionArea) {
            actionArea.innerHTML = (currentNum === 1) ? '' : `<button type="button" class="btn-danger" onclick="deleteCard(this)">刪除</button>`;
        }
    });
}

window.toggleUnlock = function(buttonObj) {
    const card = buttonObj.closest('.station-card');
    const cards = Array.from(document.querySelectorAll('.station-card'));
    const index = cards.indexOf(card);
    const isUnlocked = card.getAttribute('data-unlocked') === 'true';
    if (isUnlocked) {
        card.setAttribute('data-unlocked', 'false');
        buttonObj.innerText = "🔒 智慧篩選中";
        buttonObj.style.backgroundColor = "#e2e8f0";
        buttonObj.style.color = "#4a5568";
    } else {
        card.setAttribute('data-unlocked', 'true');
        buttonObj.innerText = "🔓 已解除限制";
        buttonObj.style.backgroundColor = "#feebc8";
        buttonObj.style.color = "#c05621";
    }
    renderSmartOptions(card, index);
    updateFollowStations(index);
};

window.deleteCard = function(buttonObj) {
    const card = buttonObj.closest('.station-card');
    if (card) {
        card.remove();
        refreshStationLabels();
        checkDirectRouteVisibility();
    }
};

function addStationCard() {
    const container = document.getElementById('stationContainer');
    if(!container) return; 
    
    const card = document.createElement('div');
    card.className = 'card station-card';
    card.setAttribute('data-unlocked', 'false');

    card.innerHTML = `
        <div class="station-header">
            <span class="station-label">第 站</span>
            <div class="station-action"></div>
        </div>
        <div style="margin-bottom: 10px; display: flex; gap: 8px; align-items: flex-end;">
            <div style="flex: 1;">
                <label>車站名</label>
                <select class="st-name"></select>
            </div>
            <button type="button" onclick="toggleUnlock(this)" style="padding: 11px 8px; font-size: 0.8rem; border: 1px solid #cbd5e0; border-radius: 8px; background-color: #e2e8f0; color: #4a5568; font-weight: bold; white-space: nowrap; height: 45px;">🔒 智慧篩選中</button>
        </div>
        <div class="grid-4">
            <div><label>連掛重</label><input type="number" class="st-gua-r" value="0" step="0.1" onfocus="this.select();"></div>
            <div><label>連掛空</label><input type="number" class="st-gua-k" value="0" step="0.1" onfocus="this.select();"></div>
            <div><label>摘下重</label><input type="number" class="st-zhai-r" value="0" step="0.1" onfocus="this.select();"></div>
            <div><label>摘下空</label><input type="number" class="st-zhai-k" value="0" step="0.1" onfocus="this.select();"></div>
        </div>
    `;
    
    container.appendChild(card);
    const select = card.querySelector('.st-name');
    const allCards = Array.from(document.querySelectorAll('.station-card'));
    const currentIndex = allCards.indexOf(card);
    
    if (currentIndex === 0) {
        select.addEventListener('change', () => { updateFollowStations(0); checkDirectRouteVisibility(); });
    } else {
        select.addEventListener('change', () => { updateFollowStations(currentIndex); checkDirectRouteVisibility(); });
    }

    refreshStationLabels();
    checkDirectRouteVisibility();
}

// 核心里程計算
function getFreightDistance(st1, st2) {
    const crewKey = document.getElementById('crewSelector').value;
    const crewData = window.allCrewDatabases[crewKey];
    
    if (crewKey === 'chiayi' && crewData && crewData.lookupTable) {
        const key1 = `${st1}-${st2}`;
        const key2 = `${st2}-${st1}`;
        if (crewData.lookupTable[key1] !== undefined) return crewData.lookupTable[key1];
        if (crewData.lookupTable[key2] !== undefined) return crewData.lookupTable[key2];
        if (st1 === st2) return 0;
    }
    const s1 = freightDatabase[st1];
    const s2 = freightDatabase[st2];
    if (!s1 || !s2) return 0;

    // 專線與支線優先通關
    if (s1.line === "專線" && s1.parent === st2) return s1.km;
    if (s2.line === "專線" && s2.parent === st1) return s2.km;
    if ((st1 === "中興支線" && st2 === "二水") || (st2 === "中興支線" && st1 === "二水")) return 16;
    if (s1.line === "集集線" && st2 === "二水") return s1.km;
    if (s2.line === "集集線" && st1 === "二水") return s2.km;
    if (s1.line === "集集線" && s2.line === "集集線") return Math.abs(s1.km - s2.km);
    if (s1.line === "集集線") return s1.km + getFreightDistance("二水", st2);
    if (s2.line === "集集線") return s2.km + getFreightDistance(st1, "二水");
    if (st1 === "中興支線") return 16 + getFreightDistance("二水", st2);
    if (st2 === "中興支線") return 16 + getFreightDistance(st1, "二水");

    const isNorthSide = (st1 === "新竹貨" || st1 === "新竹" || st1 === "竹南" || st2 === "新竹貨" || st2 === "新竹" || st2 === "竹南");
    const isSouthSide = (st1 === "彰化" || st1 === "員林" || st1 === "社頭" || st1 === "田中" || st1 === "二水" || st1 === "林內" || st1 === "斗六" || st1 === "斗南" || st1 === "大林" || st1 === "民雄" || st1 === "嘉義" || st2 === "彰化" || st2 === "員林" || st2 === "社頭" || st2 === "田中" || st2 === "二水" || st2 === "林內" || st2 === "斗六" || st2 === "斗南" || st2 === "大林" || st2 === "民雄" || st2 === "嘉義");
    const hiddenInput = document.getElementById('currentDirectRoute');
    
    // ==========================================
    // 1. 【直達車流派】（如 新竹貨 ⇄ 二水）
    // ==========================================
    if (isNorthSide && isSouthSide) {
        const chosenRoute = hiddenInput ? hiddenInput.value : 'sea';
        if (chosenRoute === 'mountain') {
            return Math.abs(s1.km - s2.km); 
        } else {
            const northStation = (s1.km < s2.km) ? s1 : s2;
            const southStation = (s1.km < s2.km) ? s2 : s1;
            const northToChunan = Math.abs(northStation.km - 121.7);
            const changhuaToSouth = Math.abs(southStation.km - 207.2);
            return northToChunan + 90.2 + changhuaToSouth; 
        }
    }

    // ==========================================
    // 2. 【海線內部區間流派】
    // ==========================================
    if (s1.sea_km !== undefined && s2.sea_km !== undefined) {
        if (!((st1 === "竹南" && st2 === "彰化") || (st2 === "竹南" && st1 === "彰化"))) {
            return Math.abs(s1.sea_km - s2.sea_km);
        }
    }

    // ==========================================
    // 3. 【交叉跨線車流派】（如 三義 ⇄ 沙鹿）
    // ==========================================
    if ((s1.sea_km !== undefined) !== (s2.sea_km !== undefined)) {
        const isHubIntersection = (st1 === "彰化" || st1 === "竹南" || st2 === "彰化" || st2 === "竹南");
        const theOtherStation = (st1 === "彰化" || st1 === "竹南") ? s2 : s1;
        
        if (isHubIntersection && (theOtherStation.line === "山線" || theOtherStation.line === "幹線")) {
            // 普通幹線對減
        } else {
            const chosenRoute = hiddenInput ? hiddenInput.value : 'sea'; 
            const seaObj = (s1.sea_km !== undefined) ? s1 : s2;
            const trunkObj = (s1.sea_km === undefined) ? s1 : s2;

            if (chosenRoute === 'sea') {
                return Math.abs(trunkObj.km - 207.2) + Math.abs(seaObj.sea_km - 90.2); // 經由彰化
            } else {
                return Math.abs(trunkObj.km - 121.7) + seaObj.sea_km; // 經由竹南
            }
        }
    }

    // ==========================================
    // 4. 【純普通幹線/山線對減流派】
    // ==========================================
    return Math.abs(s1.km - s2.km);
}

// 報單數據生成
function calculateReport() {
    const names = document.querySelectorAll('.st-name');
    const guaRs = document.querySelectorAll('.st-gua-r');
    const guaKs = document.querySelectorAll('.st-gua-k');
    const zhaiRs = document.querySelectorAll('.st-zhai-r');
    const zhaiKs = document.querySelectorAll('.st-zhai-k');
    const errorNotice = document.getElementById('errorNotice');

    if(errorNotice) { errorNotice.style.display = 'none'; errorNotice.innerHTML = ''; }

    let stations = [];
    for(let i=0; i<names.length; i++) {
        if(!names[i].value) continue;
        stations.push({
            name: names[i].value,
            guaR: parseFloat(guaRs[i].value) || 0,
            guaK: parseFloat(guaKs[i].value) || 0,
            zhaiR: parseFloat(zhaiRs[i].value) || 0,
            zhaiK: parseFloat(zhaiKs[i].value) || 0,
            diffR: 0, diffK: 0, dist: 0, kmR: 0, kmK: 0
        });
    }

    if(stations.length < 2) {
        if(errorNotice) { errorNotice.style.display = 'block'; errorNotice.innerHTML = '⚠️ 請至少選擇兩個站點進行區間結算！'; }
        return;
    }

    let currentR = 0, currentK = 0;
    let totalGuaR = 0, totalGuaK = 0, totalZhaiR = 0, totalZhaiK = 0;
    let totalKmR = 0, totalKmK = 0;

    for(let i = 0; i < stations.length; i++) {
        totalGuaR += stations[i].guaR; totalGuaK += stations[i].guaK;
        totalZhaiR += stations[i].zhaiR; totalZhaiK += stations[i].zhaiK;
    }

    const isWeightBalanced = Math.abs(totalGuaR - totalZhaiR) < 0.01;
    const isEmptyBalanced = Math.abs(totalGuaK - totalZhaiK) < 0.01;

    if (!isWeightBalanced || !isEmptyBalanced) {
        if(errorNotice) {
            let errorHtml = `<div style="font-size: 1.05rem; margin-bottom: 5px;">⚠️ 數據錯誤！摘掛車數無法互相抵消：</div>`;
            if (!isWeightBalanced) errorHtml += `<div>❌ <b>重車不平衡：</b>總共連掛 ${totalGuaR} 輛，卻摘下了 ${totalZhaiR} 輛 (相差 ${Math.abs(totalGuaR - totalZhaiR).toFixed(1)} 輛)</div>`;
            if (!isEmptyBalanced) errorHtml += `<div>❌ <b>空車不平衡：</b>總共連掛 ${totalGuaK} 輛，卻摘下了 ${totalZhaiK} 輛 (相差 ${Math.abs(totalGuaK - totalZhaiK).toFixed(1)} 輛)</div>`;
            errorHtml += `<div style="margin-top: 5px; font-size: 0.8rem; color: #666;">※ 請修正上方各站點的連掛與摘下數量。</div>`;
            errorNotice.innerHTML = errorHtml; errorNotice.style.display = 'block';
            errorNotice.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return; 
    }

    for(let i = 0; i < stations.length; i++) {
        currentR = currentR + stations[i].guaR - stations[i].zhaiR;
        currentK = currentK + stations[i].guaK - stations[i].zhaiK;

        if(i < stations.length - 1) {
            let nextStation = stations[i+1];
            let distance = getFreightDistance(stations[i].name, nextStation.name);
            let ceiledDistance = Math.ceil(distance);
            
            nextStation.dist = ceiledDistance;
            nextStation.diffR = currentR; nextStation.diffK = currentK;
            nextStation.kmR = Math.round((currentR * ceiledDistance) * 10) / 10;
            nextStation.kmK = Math.round((currentK * ceiledDistance) * 10) / 10;
            totalKmR += nextStation.kmR; totalKmK += nextStation.kmK;
        }
    }

    document.getElementById('resTrainNo').innerText = document.getElementById('trainNo').value;
    document.getElementById('resDate').innerText = getFormattedDateString();

    let html = `<tr style="font-weight:bold; background-color:#fff3cd;">
        <td>共計</td><td>${totalGuaR || ''}</td><td>${totalGuaK || ''}</td><td>${totalZhaiR || ''}</td><td>${totalZhaiK || ''}</td>
        <td></td><td></td><td></td><td>${Math.round(totalKmR*10)/10 || ''}</td><td>${Math.round(totalKmK*10)/10 || ''}</td>
    </tr>`;

    stations.forEach((st) => {
        html += `<tr>
            <td><strong>${st.name}</strong></td><td>${st.guaR || ''}</td><td>${st.guaK || ''}</td><td>${st.zhaiR || ''}</td><td>${st.zhaiK || ''}</td>
            <td>${st.diffR || ''}</td><td>${st.diffK || ''}</td><td>${st.dist || ''}</td><td>${st.kmR || ''}</td><td>${st.kmK || ''}</td>
        </tr>`;
    });

    document.getElementById('resultBody').innerHTML = html;
    document.getElementById('resultModal').style.display = 'block';
}

window.closeModal = function() { document.getElementById('resultModal').style.display = 'none'; }

function initApp() {
    setupSmartDatePicker();
    document.getElementById('btnAddStation').addEventListener('click', addStationCard);
    document.getElementById('btnCalc').addEventListener('click', calculateReport);
    document.getElementById('btnCloseModal').addEventListener('click', closeModal);
    document.getElementById('trainNo').addEventListener('input', () => { updateFollowStations(-1); checkDirectRouteVisibility(); });
    
    // 【新增】車班切換下拉選單連動監聽
    document.getElementById('crewSelector').addEventListener('change', (e) => {
        switchCrewVersion(e.target.value);
    });

    addStationCard();
    addStationCard();
    checkDirectRouteVisibility();
}

const startScheduler = setInterval(() => {
    if (document.getElementById('stationContainer') && document.getElementById('btnCalc')) {
        clearInterval(startScheduler);
        initApp();
    }
}, 50);
