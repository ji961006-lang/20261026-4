// ====== 全局變數宣告 ======
let options = []; // 儲存所有可拖曳選項的陣列
let targets = []; // 儲存所有目標填空框的陣列
let score = 0; // 玩家當前得分
let isSubmitted = false; // 紀錄是否已經提交答案
let submitBtn; // 提交答案按鈕
let resetBtn; // 重置遊戲按鈕
let animFrame = 0; // 頂部GIF動畫效果的幀數計數器

// 英文題目與選項資料設定
const questionData = {
  sentenceParts: ["An ", " a day keeps the ", " away, but a ", " gives you energy."], // 題目句子分割片段
  correctAnswers: ["apple", "doctor", "banana"], // 三個填空框對應的正確答案
  allOptions: ["apple", "doctor", "banana", "cat", "car", "computer"] // 總共 6 個可選單字選項
};

// ====== p5.js 初始化與預載 ======
function setup() {
  // 建立全螢幕畫布，並設置為響應式大小
  createCanvas(windowWidth, windowHeight);
  
  // 初始化遊戲與繪製元素
  initGame();
  
  // 建立 UI 控制按鈕
  createUIButtons();
}

// ====== 主繪製循環 (每一幀執行) ======
function draw() {
  // 設定背景為淺藍灰色的舒適質感
  background(240, 244, 248);

  // 1. 繪製頂部動態動畫效果 (模擬 GIF 動畫)
  drawTopGifAnimation();

  // 2. 繪製測驗標題與說明文字
  drawHeader();

  // 3. 繪製英文題目句子與目標放置框
  drawQuestionArea();

  // 4. 繪製下方 6 個可拖曳的選項卡片
  drawOptions();

  // 5. 繪製遊戲結果與得分訊息
  drawScoreAndFeedback();
}

// ====== 初始化遊戲機制 ======
function initGame() {
  score = 0; // 歸零分數
  isSubmitted = false; // 重置提交狀態
  options = []; // 清空選項陣列
  targets = []; // 清空目標框陣列

  // 計算響應式版面尺寸
  let targetWidth = min(width * 0.18, 140); // 填空框寬度
  let targetHeight = 45; // 填空框高度
  let startX = width * 0.1; // 題目起點 X 座標
  let startY = height * 0.38; // 題目起點 Y 座標

  // 建立 3 個目標放置框 (Targets)
  for (let i = 0; i < 3; i++) {
    // 依據螢幕寬度計算每個放置框的位置
    let xPos = startX + (i + 1) * (width * 0.23); 
    targets.push({
      id: i, // 放置框編號
      x: xPos, // X 座標
      y: startY, // Y 座標
      w: targetWidth, // 寬度
      h: targetHeight, // 高度
      correctWord: questionData.correctAnswers[i], // 正確答案文字
      placedOption: null // 目前放入的選項物件 (初始為空)
    });
  }

  // 建立 6 個可拖曳選項 (Options)
  let optionWidth = min(width * 0.13, 120); // 選項卡片寬度
  let optionHeight = 45; // 選項卡片高度
  let optionStartY = height * 0.68; // 選項區域 Y 座標
  let totalOptionsWidth = 6 * optionWidth + 5 * 15; // 計算 6 個選項的總寬度
  let optionStartX = (width - totalOptionsWidth) / 2; // 讓 6 個選項水平置中

  // 隨機打亂 6 個選項的順序
  let shuffledWords = shuffle([...questionData.allOptions]);

  for (let i = 0; i < 6; i++) {
    // 計算每個選項卡片的初始位置
    let ox = optionStartX + i * (optionWidth + 15);
    let oy = optionStartY;

    options.push({
      id: i, // 選項編號
      text: shuffledWords[i], // 選項英文單字
      x: ox, // 當前 X 座標
      y: oy, // 當前 Y 座標
      homeX: ox, // 初始歸位 X 座標
      homeY: oy, // 初始歸位 Y 座標
      w: optionWidth, // 寬度
      h: optionHeight, // 高度
      isDragging: false, // 是否正在被拖曳
      offsetX: 0, // 拖曳時滑鼠偏移 X
      offsetY: 0, // 拖曳時滑鼠偏移 Y
      target: null // 目前吸附的目標框 (若無則為 null)
    });
  }
}

// ====== 頂部 GIF 動畫效果繪製 (程序化動態繪製) ======
function drawTopGifAnimation() {
  animFrame += 0.05; // 增加動畫幀數

  // 繪製頂部動畫區域背景框
  fill(255);
  stroke(220);
  strokeWeight(2);
  rect(width * 0.1, 15, width * 0.8, 110, 15);

  // 動態旋轉的五角星與光芒 (模擬 GIF 動畫)
  push();
  translate(width * 0.2, 70); // 移動到左側星號中心
  rotate(sin(animFrame)); // 左右搖擺旋轉
  fill(255, 204, 0); // 金黃色
  noStroke();
  ellipse(0, 0, 40 + sin(animFrame * 2) * 10, 40 + sin(animFrame * 2) * 10); // 呼吸縮放效果
  pop();

  // 中央動態波浪文字特效
  textAlign(CENTER, CENTER);
  textSize(24);
  textFont('Helvetica');
  fill(70, 130, 180);
  let titleText = "✨ English Interactive Drag Quiz ✨";
  for (let i = 0; i < titleText.length; i++) {
    // 為每個字母計算獨立的波浪 Y 軸偏移
    let waveY = sin(animFrame * 2 + i * 0.3) * 6;
    text(titleText[i], width / 2 - 180 + i * 11, 65 + waveY);
  }

  // 右側星號動畫
  push();
  translate(width * 0.8, 70); // 移動到右側星號中心
  rotate(-cos(animFrame)); // 反向旋轉
  fill(255, 105, 180); // 粉彩色
  noStroke();
  ellipse(0, 0, 35 + cos(animFrame * 2) * 8, 35 + cos(animFrame * 2) * 8); // 呼吸縮放效果
  pop();
}

// ====== 繪製標題與說明文字 ======
function drawHeader() {
  textAlign(CENTER, TOP);
  fill(50);
  noStroke();
  textSize(min(width * 0.02, 20));
  text("Instructions: Drag the correct English words into the blank boxes below.", width / 2, 140);
}

// ====== 繪製英文題目句子與目標放置框 ======
function drawQuestionArea() {
  textAlign(CENTER, CENTER);
  textSize(min(width * 0.018, 18));
  textFont('Georgia');

  // 繪製題目底板背景
  fill(255);
  stroke(200);
  strokeWeight(1);
  rect(width * 0.08, height * 0.32, width * 0.84, height * 0.22, 12);

  // 繪製 3 個目標放置框 (Targets)
  for (let t of targets) {
    if (t.placedOption) {
      // 若已放入選項，顯示綠/藍色狀態
      fill(230, 245, 255);
      stroke(100, 180, 240);
    } else {
      // 空框顯示虛線灰色狀態
      fill(245);
      stroke(180);
    }
    strokeWeight(2);
    rect(t.x - t.w / 2, t.y - t.h / 2, t.w, t.h, 8); // 繪製方框

    // 如果未提交且為空，顯示 Prompt 提示字眼
    if (!t.placedOption) {
      fill(160);
      noStroke();
      textSize(14);
      text("[ Drop Here ]", t.x, t.y);
    }
  }

  // 繪製題目文字提示 (句子前中後段)
  fill(40);
  noStroke();
  textSize(min(width * 0.016, 17));
  let y = height * 0.38;

  text(questionData.sentenceParts[0], targets[0].x - targets[0].w / 2 - 40, y);
  text(questionData.sentenceParts[1], (targets[0].x + targets[1].x) / 2, y);
  text(questionData.sentenceParts[2], (targets[1].x + targets[2].x) / 2, y);
  text(questionData.sentenceParts[3], targets[2].x + targets[2].w / 2 + 80, y);
}

// ====== 繪製 6 個可拖曳選項 ======
function drawOptions() {
  // 繪製選項區域背景
  fill(250);
  stroke(210);
  strokeWeight(1);
  rect(width * 0.08, height * 0.60, width * 0.84, height * 0.22, 12);

  fill(80);
  noStroke();
  textSize(16);
  textAlign(LEFT, TOP);
  text("Word Options (6 Choices):", width * 0.1, height * 0.62);

  // 繪製非拖曳中的選項
  for (let opt of options) {
    if (!opt.isDragging) {
      drawSingleOption(opt);
    }
  }

  // 優先將「正在拖曳中」的選項畫在最上層，避免被遮擋
  for (let opt of options) {
    if (opt.isDragging) {
      drawSingleOption(opt);
    }
  }
}

// 繪製單個選項卡片細節
function drawSingleOption(opt) {
  push();
  if (opt.isDragging) {
    // 拖曳中：加上陰影與放大效果
    fill(255);
    stroke(70, 130, 180);
    strokeWeight(3);
    shadowEffect();
    rect(opt.x - 5, opt.y - 5, opt.w + 10, opt.h + 10, 10);
  } else {
    // 一般狀態：精緻圓角按鈕外觀
    fill(255);
    stroke(100, 149, 237);
    strokeWeight(2);
    rect(opt.x, opt.y, opt.w, opt.h, 8);
  }

  // 繪製選項英文單字
  fill(30);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(16);
  textFont('Helvetica');
  text(opt.text, opt.x + opt.w / 2, opt.y + opt.h / 2);
  pop();
}

// 陰影輔助效果
function shadowEffect() {
  drawingContext.shadowOffsetX = 4;
  drawingContext.shadowOffsetY = 4;
  drawingContext.shadowBlur = 8;
  drawingContext.shadowColor = 'rgba(0, 0, 0, 0.2)';
}

// ====== 滑鼠點擊事件 (開始拖曳) ======
function mousePressed() {
  if (isSubmitted) return; // 如果已交卷，停止拖曳互動

  // 倒序檢查（讓位於上層的卡片優先被抓取）
  for (let i = options.length - 1; i >= 0; i--) {
    let opt = options[i];
    // 判斷滑鼠是否點擊在選項卡片範圍內
    if (
      mouseX >= opt.x &&
      mouseX <= opt.x + opt.w &&
      mouseY >= opt.y &&
      mouseY <= opt.y + opt.h
    ) {
      opt.isDragging = true; // 開啟拖曳狀態
      opt.offsetX = mouseX - opt.x; // 計算滑鼠點擊點與卡片左上角的 X 偏移量
      opt.offsetY = mouseY - opt.y; // 計算滑鼠點擊點與卡片左上角的 Y 偏移量

      // 如果該選項原本已在目標框內，將目標框解除綁定
      if (opt.target) {
        opt.target.placedOption = null;
        opt.target = null;
      }
      break; // 只拖曳最上面的一張卡片
    }
  }
}

// ====== 滑鼠拖曳事件 (移動中) ======
function mouseDragged() {
  for (let opt of options) {
    if (opt.isDragging) {
      opt.x = mouseX - opt.offsetX; // 更新卡片 X 座標為滑鼠位置減去偏移量
      opt.y = mouseY - opt.offsetY; // 更新卡片 Y 座標為滑鼠位置減去偏移量
    }
  }
}

// ====== 滑鼠釋放事件 (放開選項與吸附判定) ======
function mouseReleased() {
  for (let opt of options) {
    if (opt.isDragging) {
      opt.isDragging = false; // 關閉拖曳狀態

      let snapped = false; // 紀錄是否成功吸附到目標框

      // 檢查是否拖放到任何一個目標框 (Target) 近郊
      for (let t of targets) {
        // 計算卡片中心點與目標框中心點的距離
        let optCenterX = opt.x + opt.w / 2;
        let optCenterY = opt.y + opt.h / 2;
        let d = dist(optCenterX, optCenterY, t.x, t.y);

        // 如果距離小於 60px，且該目標框目前是空的
        if (d < 60 && t.placedOption === null) {
          // 將卡片自動吸附對齊到目標框中心
          opt.x = t.x - opt.w / 2;
          opt.y = t.y - opt.h / 2;
          opt.target = t; // 綁定目標框
          t.placedOption = opt; // 綁定選項
          snapped = true;
          break;
        }
      }

      // 如果沒有成功吸附到任何框，自動彈回初始下方選項區
      if (!snapped) {
        opt.x = opt.homeX;
        opt.y = opt.homeY;
        opt.target = null;
      }
    }
  }
}

// ====== 建立 UI 控制按鈕 (Submit / Reset) ======
function createUIButtons() {
  // 建立「提交答案」按鈕
  submitBtn = createButton('Submit Answer');
  submitBtn.position(width / 2 - 120, height * 0.86);
  submitBtn.size(110, 42);
  styleButton(submitBtn, '#4CAF50'); // 設定綠色樣式
  submitBtn.mousePressed(checkAnswers); // 綁定驗證答案事件

  // 建立「重置測驗」按鈕
  resetBtn = createButton('Reset Quiz');
  resetBtn.position(width / 2 + 10, height * 0.86);
  resetBtn.size(110, 42);
  styleButton(resetBtn, '#f44336'); // 設定紅色樣式
  resetBtn.mousePressed(initGame); // 綁定重新開始事件
}

// 按鈕 CSS 樣式封裝設定
function styleButton(btn, bgColor) {
  btn.style('font-size', '16px');
  btn.style('font-weight', 'bold');
  btn.style('color', '#ffffff');
  btn.style('background-color', bgColor);
  btn.style('border', 'none');
  btn.style('border-radius', '8px');
  btn.style('cursor', 'pointer');
  btn.style('box-shadow', '0 4px 6px rgba(0,0,0,0.1)');
}

// ====== 驗證答案與算分邏輯 ======
function checkAnswers() {
  if (isSubmitted) return;

  let correctCount = 0; // 答對題數

  // 遍歷所有 3 個目標框檢查答案
  for (let t of targets) {
    if (t.placedOption && t.placedOption.text === t.correctWord) {
      correctCount++; // 答案完全吻合
    }
  }

  // 每題 33.3 分，答對 3 題為 100 分
  score = Math.round((correctCount / 3) * 100);
  isSubmitted = true; // 標記為已提交
}

// ====== 繪製分數與回饋結果訊息 ======
function drawScoreAndFeedback() {
  if (!isSubmitted) return;

  textAlign(CENTER, CENTER);
  textSize(22);
  textFont('Helvetica');

  // 滿分或未滿分給予不同顏色的提示訊息
  if (score === 100) {
    fill(46, 139, 87); // 森林綠
    text(`🎉 Perfect! Score: ${score}/100! Excellent job!`, width / 2, height * 0.94);
  } else {
    fill(220, 20, 60); // 緋紅色
    text(`❌ Score: ${score}/100. Click 'Reset Quiz' to try again!`, width / 2, height * 0.94);
  }
}

// ====== 響應式網頁：視窗大小改變時自動重新調整畫布 ======
function windowResized() {
  // 重新設置畫布大小為當前瀏覽器視窗大小
  resizeCanvas(windowWidth, windowHeight);

  // 重新更新按鈕位置
  if (submitBtn && resetBtn) {
    submitBtn.position(width / 2 - 120, height * 0.86);
    resetBtn.position(width / 2 + 10, height * 0.86);
  }

  // 重新初始化卡片與框的位置，確保不會跑版
  initGame();
}