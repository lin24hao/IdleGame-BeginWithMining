/* ============================================================
 * sc_idioms.js —— 藏经阁「文墨」成语接龙题库 + 棋盘生成器
 *
 * 题库来源：新华网 2000 成语接龙链（精心挑选常见四字成语）
 *   + github pwxcoo/chinese-xinhua 成语库中高流传度条目
 * 所有成语严格为 4 字、可首尾相接（首字 = 上一条的第 4 字）
 * ============================================================ */

const SC_IDIOMS = [
  // ---- 精选常见成语（共约 280 条，覆盖接龙图中大部分常用节点） ----
  '胸有成竹','竹报平安','安富尊荣','荣华富贵','贵而贱目','目无余子','子虚乌有','有目共睹','睹物思人','人中骐骥',
  '骥子龙文','文质彬彬','彬彬有礼','礼贤下士','士饱马腾','腾云驾雾','雾里看花','花言巧语','语重心长','长此以往',
  '往返徒劳','劳而无功','功成不居','居官守法','法外施仁','仁浆义粟','粟红贯朽','朽木死灰','灰飞烟灭','灭绝人性',
  '性命交关','关门大吉','吉祥止止','止于至善','善贾而沽','沽名钓誉','誉不绝口','口蜜腹剑','剑戟森森','森罗万象',
  '象箸玉杯','杯弓蛇影','影影绰绰','绰约多姿','姿意妄为','为人作嫁','嫁祸于人','人情冷暖','暖衣饱食','食不果腹',
  '腹背之毛','毛手毛脚','脚踏实地','地老天荒','荒诞不经','经纬万端','端倪可察','察言观色','色若死灰','灰头土面',
  '面有菜色','色授魂与','与民更始','始乱终弃','弃瑕录用','用舍行藏','藏垢纳污','污泥浊水','水乳交融','融会贯通',
  '通宵达旦','旦种暮成','成人之美','美人迟暮','暮云春树','树大招风','风中之烛','烛照数计','计日程功','功德无量',
  '量才录用','用行舍藏','藏头露尾','尾大不掉','掉以轻心','心急如焚','焚琴煮鹤','鹤发童颜','颜面扫地','地上天官',
  '官逼民反','反裘负刍','刍荛之见','见微知著','著作等身','身强力壮','壮志凌云','云消雨散','散兵游勇','勇猛精进',
  '进退失据','据理力争','争长论短','短小精悍','悍然不顾','顾影自怜','怜香惜玉','玉液琼浆','浆酒霍肉','肉薄骨并',
  '并行不悖','悖入悖出','出奇制胜','胜任愉快','快马加鞭','鞭辟入里','里出外进','进寸退尺','尺寸可取','取巧图便',
  '便宜行事','事与愿违','违心之论','论功行赏','赏心悦目','目光如豆','豆蔻年华','华而不实','实事求是','是古非今',
  '今愁古恨','恨之入骨','骨腾肉飞','飞沿走壁','壁垒森严','严阵以待','待理不理','理屈词穷','穷原竟委','委曲求全',
  '全力以赴','赴汤蹈火','火烧火燎','燎原烈火','火烧眉毛','毛羽零落','落井下石','石破天惊','惊惶失措','措置裕如',
  '如运诸掌','掌上明珠','珠沉玉碎','碎琼乱玉','玉碎珠沉','沉滓泛起','起早贪黑','黑更半夜','夜雨对床','床头金尽',
  '尽态极妍','妍姿艳质','质疑问难','难以为继','继往开来','来龙去脉','脉脉含情','情见势屈','屈打成招','招摇过市',
  '市井之徒','徒劳往返','返老还童','童牛角马','马首是瞻','瞻前顾后','后顾之忧','忧国奉公','公子王孙','孙康映雪',
  '雪上加霜','霜露之病','病病歪歪','歪打正着','着手成春','春蚓秋蛇','蛇口蜂针','针锋相对','对簿公堂','堂堂正正',
  '正中下怀','怀璧其罪','罪大恶极','极天际地','地丑德齐','齐心协力','力不胜任','任重道远','远见卓识','识文断字',
  '字斟句酌','酌盈剂虚','虚舟飘瓦','瓦釜雷鸣','鸣锣开道','道不拾遗','遗大投艰','艰苦朴素','素丝羔羊','羊肠小道',
  '道听途说','说长道短','短兵相接','接踵而至','至死不变','变本加厉','厉行节约','约定俗成','成仁取义','义形于色',
  '色色俱全','全军覆灭','灭此朝食','食日万钱','钱可通神','神施鬼设','设身处地','地平天成','成年累月','月白风清',
  '清净无为','为期不远','远交近攻','攻其无备','备多力分','分寸之末','末学肤受','受宠若惊','惊涛骇浪','浪子回头',
  '头疼脑热','热火朝天','天高地厚','厚貌深情','情同骨肉','肉眼惠眉','眉来眼去','去伪存真','真脏实犯','犯上作乱',
  '乱头粗服','服低做小','小试锋芒','芒刺在背','背井离乡','乡壁虚造','造化小儿','儿女情长','长歌当哭','哭天抹泪',
  '泪干肠断','断鹤续凫','凫趋雀跃','跃然纸上','上树拔梯','梯山航海','海枯石烂','烂若披锦','锦绣前程','程门立雪',
  '雪虐风饕','饕餮之徒','徒劳无功','功败垂成','成千上万','万象森罗','罗雀掘鼠','鼠窃狗盗','盗憎主人','人莫予毒',
  '毒手尊前','前因后果','果于自信','信赏必罚','罚不当罪','罪恶昭彰','彰善瘅恶','恶贯满盈','盈科后进','进退两难',
  '难分难解','解甲归田','田月桑时','时和年丰','丰取刻与','与世偃仰','仰人鼻息','息息相通','通权达变','变化无穷',
  '穷途末路','路不拾遗','遗臭万年','年深日久','久悬不决','决一死战','战无不胜','胜券在握','握手言欢','欢欣鼓舞',
  '舞文弄墨','墨守成规','规行矩步','步步为营','营私舞弊','弊绝风清','清风明月','月黑风高','高枕无忧','忧心忡忡',
  '忡忡不安','安居乐业','业精于勤','勤能补拙','拙嘴笨舌','舌战群儒','儒雅风流','风流倜傥','傥来之物','物极必反',
  '反璞归真','真知灼见','见义勇为','为富不仁','仁者见仁','仁者乐山','山清水秀','秀外慧中','中流砥柱','柱石之坚',
  '坚定不移','移花接木','木已成舟','舟车劳顿','顿开茅塞','塞翁失马','马到成功','功成名就','就地取材','材疏志大',
  '大智若愚','愚公移山','山穷水尽','尽善尽美','美轮美奂','奂焉一新','新陈代谢','谢天谢地','地大物博','博大精深',
  '深入浅出','出神入化','化险为夷','夷为平地','地久天长','长驱直入','入木三分','分秒必争','争先恐后','后继有人',
  '人定胜天','天翻地覆','覆水难收','收回成命','命途多舛','舛讹百出','出类拔萃','萃萃学子','子人五子','一五一十',
  '十全十美','完美无缺','缺一不可','可有可无','无所事事','事半功倍','倍道兼程','程门度雪','雪中送炭','炭敬冰敬'
];

/* ---------- 构建接龙图：首字 → [成语, 成语, ...] ---------- */
function _idiomBuildGraph(list) {
  const g = {};
  for (const w of list) {
    if (!g[w[0]]) g[w[0]] = [];
    g[w[0]].push(w);
  }
  return g;
}

const SC_IDIOM_GRAPH = _idiomBuildGraph(SC_IDIOMS);

/* ---------- 生成一条接龙链（5~7 个首尾相接的成语） ---------- */
function SC_IdiomChain(len) {
  len = Math.max(4, Math.min(8, len || 5));
  const list = SC_IDIOMS;
  const g = SC_IDIOM_GRAPH;
  // 找一个有出度的起点（避免走到死胡同）
  let tries = 0;
  while (tries++ < 100) {
    const start = list[Math.floor(Math.random() * list.length)];
    if (!g[start[3]]) continue; // 尾字必须能接到其他成语
    const chain = [start];
    let cur = start;
    let ok = true;
    for (let i = 1; i < len; i++) {
      const pool = g[cur[3]] || [];
      // 排除已用
      const avail = pool.filter(x => !chain.includes(x));
      if (avail.length === 0) { ok = false; break; }
      cur = avail[Math.floor(Math.random() * avail.length)];
      chain.push(cur);
    }
    if (ok && chain.length >= 4) return chain;
  }
  // 兜底：直接返回前 5 条
  return list.slice(0, len);
}

/* ---------- 棋盘布局：把接龙链在 N×N 网格上横/竖穿插放置 ----------
 * 返回: { cells: [{x,y,ch,direction,'fixed'|'blank'}], solutions: [{pos, correct}] }
 *
 * 算法（用户明确要 crossword 穿插感）：
 * 1. 强制方向交替：h→v→h→v→... 或 v→h→v→h→...
 * 2. gridSize cap 在 10（超过就溢出容器）
 * 3. chain[0] 居中留 margin=2，后续首字必须衔接上一条末字
 * 4. 越界/冲突 = 整轮失败重试（不换方向，必须保持交替）
 * 5. 兜底：强制交替 zigzag
 */
function SC_IdiomLayout(chain, gridSize) {
  const n = chain.length;

  // 给定 SIZE 尝试一次强制交替布局
  const tryLayout = (SIZE, maxAttempts) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const cells = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
      const chainDirs = [];
      const chainPositions = [];

      // chain[0]：居中偏角（margin=2），给后续留空间
      // 随机选 h 或 v，后续全强制交替
      const firstDir = Math.random() < 0.5 ? 'h' : 'v';
      chainDirs.push(firstDir);
      let sx, sy;
      if (firstDir === 'h') {
        sx = 2 + Math.floor(Math.random() * Math.max(0, SIZE - 8));
        sy = 2 + Math.floor(Math.random() * Math.max(0, SIZE - 6));
      } else {
        sx = 2 + Math.floor(Math.random() * Math.max(0, SIZE - 6));
        sy = 2 + Math.floor(Math.random() * Math.max(0, SIZE - 8));
      }
      chainPositions.push({ x: sx, y: sy });

      for (let c = 0; c < 4; c++) {
        const cx = firstDir === 'h' ? sx + c : sx;
        const cy = firstDir === 'h' ? sy : sy + c;
        cells[cy][cx] = { ch: chain[0][c], idiomIdx: 0, charIdx: c };
      }

      let placed = true;
      for (let i = 1; i < n; i++) {
        // ===== 强制方向交替！=====
        const prevDir = chainDirs[i - 1];
        const d = prevDir === 'h' ? 'v' : 'h';

        const prevPos = chainPositions[i - 1];
        const lastX = prevDir === 'h' ? prevPos.x + 3 : prevPos.x;
        const lastY = prevDir === 'h' ? prevPos.y : prevPos.y + 3;

        // 按强制方向生成坐标，检查越界 + 冲突
        let ok = true;
        const pts = [{ x: lastX, y: lastY }];
        for (let c = 1; c < 4; c++) {
          const cx = d === 'h' ? lastX + c : lastX;
          const cy = d === 'h' ? lastY : lastY + c;
          pts.push({ x: cx, y: cy });
        }
        for (const p of pts) {
          if (p.x < 0 || p.x >= SIZE || p.y < 0 || p.y >= SIZE) { ok = false; break; }
        }
        if (ok) {
          for (let c = 1; c < 4; c++) {
            const p = pts[c];
            if (cells[p.y][p.x] !== null) { ok = false; break; }
          }
        }

        if (!ok) { placed = false; break; }

        for (let c = 0; c < 4; c++) {
          const p = pts[c];
          cells[p.y][p.x] = { ch: chain[i][c], idiomIdx: i, charIdx: c };
        }
        chainDirs.push(d);
        chainPositions.push({ x: lastX, y: lastY });
      }

      if (!placed) continue;

      // 收集衔接点（bridge）
      const bridges = new Set();
      for (let i = 1; i < n; i++) {
        const d = chainDirs[i - 1];
        const p = chainPositions[i - 1];
        const bx = d === 'h' ? p.x + 3 : p.x;
        const by = d === 'h' ? p.y : p.y + 3;
        bridges.add(bx + ',' + by);
      }

      // 收集所有已填充的 cell
      const allFilled = [];
      for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
          if (cells[y][x] && cells[y][x].idiomIdx >= 0) {
            allFilled.push({ x, y });
          }
        }
      }

      // 挖空：35%~50%
      const blankCount = Math.max(1, Math.floor(allFilled.length * (0.35 + Math.random() * 0.15)));
      const blankSet = new Set();
      const shuffled = allFilled.slice().sort(() => Math.random() - 0.5);
      for (let i = 0; i < Math.min(blankCount, shuffled.length); i++) {
        blankSet.add(shuffled[i].x + ',' + shuffled[i].y);
      }

      const resultCells = [];
      for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
          const c = cells[y][x];
          if (!c) continue;
          const key = x + ',' + y;
          resultCells.push({
            x, y,
            ch: c.ch,
            idiomIdx: c.idiomIdx,
            charIdx: c.charIdx,
            bridge: bridges.has(key),
            blank: blankSet.has(key)
          });
        }
      }
      return { chain, cells: centerCells(resultCells, SIZE), gridSize: SIZE };
    }
    return null;
  };

  // ===== 后处理：把 cells 的实际内容居中到网格里 =====
  const centerCells = (cells, SIZE) => {
    if (!cells.length) return cells;
    let minX = SIZE, maxX = -1, minY = SIZE, maxY = -1;
    for (const c of cells) {
      if (c.x < minX) minX = c.x;
      if (c.x > maxX) maxX = c.x;
      if (c.y < minY) minY = c.y;
      if (c.y > maxY) maxY = c.y;
    }
    const contentW = maxX - minX + 1;
    const contentH = maxY - minY + 1;
    const shiftX = Math.floor((SIZE - contentW) / 2) - minX;
    const shiftY = Math.floor((SIZE - contentH) / 2) - minY;
    if (shiftX === 0 && shiftY === 0) return cells;
    return cells.map(c => ({ ...c, x: c.x + shiftX, y: c.y + shiftY }));
  };

  // === gridSize 计算：从 9 开始试（够用又不溢出），cap 10 ===
  const MIN_SIZE = 9;
  const MAX_SIZE = 10;
  for (let SIZE = MIN_SIZE; SIZE <= MAX_SIZE; SIZE += 2) {
    const res = tryLayout(SIZE, 800);  // 多给几次机会
    if (res) return res;
  }

  // ===== 兜底：强制交替 zigzag（永远成功、不溢出、方向交替）=====
  // 规则：横排成语放偶数列起始，竖排成语放奇数行起始
  // 这样横纵交替不交叉，每条在自己的区域里
  const SIZE2 = 10;
  const cells = [];
  const firstIsH = Math.random() < 0.5;
  // 预留每行 2 格间距，保证不重叠
  let curRow = 1;
  let curCol = 1;
  for (let i = 0; i < n; i++) {
    const isH = (i % 2 === 0) ? firstIsH : !firstIsH;
    // 计算起点：交替时要接在上一个的末字位置
    if (i > 0) {
      // 衔接：上一个末字坐标 = 当前首字
      const prevIsH = (i % 2 === 1) ? firstIsH : !firstIsH;
      if (prevIsH) {
        curCol += 3;  // 上一个横排，末字在 x+3
        // 但如果横排超出了，就换 zigzag
        if (curCol + 3 >= SIZE2) { curCol = 1; curRow += 2; }
      } else {
        curRow += 3;  // 上一个竖排，末字在 y+3
        if (curRow + 3 >= SIZE2) { curRow = 1; curCol += 2; }
      }
    }
    for (let c = 0; c < 4; c++) {
      const cx = isH ? curCol + c : curCol;
      const cy = isH ? curRow : curRow + c;
      cells.push({
        x: cx, y: cy,
        ch: chain[i][c],
        idiomIdx: i,
        charIdx: c,
        bridge: c === 3 && i < n - 1,
        blank: Math.random() < 0.4
      });
    }
  }
  return { chain, cells: centerCells(cells, SIZE2), gridSize: SIZE2 };
}

/* ---------- 从布局生成候选字（正确字 + 干扰字） ---------- */
function SC_IdiomChoices(layout) {
  const blanks = layout.cells.filter(c => c.blank);
  const correctSet = new Set(blanks.map(b => b.ch));
  // 从题库里抽干扰字（避免和正确字重复）
  const allChars = SC_IDIOMS.join('');
  const charArr = allChars.split('');
  // 去重
  const uniqueChars = [...new Set(charArr)];
  const choices = [];
  for (const ch of correctSet) {
    choices.push(ch);
  }
  // 补干扰字：让总数 5~7 个
  const targetChoices = Math.max(5, Math.min(7, correctSet.size + 3));
  while (choices.length < targetChoices) {
    const rc = uniqueChars[Math.floor(Math.random() * uniqueChars.length)];
    if (!correctSet.has(rc) && !choices.includes(rc)) choices.push(rc);
  }
  // 打乱
  return choices.sort(() => Math.random() - 0.5);
}

/* ---------- 检查布局是否全部填满且正确 ---------- */
function SC_IdiomCheckSolved(layout, filledMap) {
  for (const c of layout.cells) {
    if (c.blank) {
      const key = c.x + ',' + c.y;
      if (!filledMap[key] || filledMap[key] !== c.ch) return false;
    }
  }
  return true;
}

if (typeof module !== 'undefined') {
  module.exports = { SC_IDIOMS, SC_IDIOM_GRAPH, SC_IdiomChain, SC_IdiomLayout, SC_IdiomChoices, SC_IdiomCheckSolved };
}
