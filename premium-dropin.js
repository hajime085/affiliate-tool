/*
 * 手動入力モード追加ドロップイン（Premium版デザイン対応）
 * affiliate-tool-premium-dropin.js のデザインに合わせた版
 *
 * index.html の </body> 直前、premium-dropin.js の後に追加:
 * <script src="./affiliate-tool-manual-dropin.js?v=20260513"></script>
 */
(function () {
  'use strict';

  window.addEventListener('DOMContentLoaded', function () {
    injectModeToggle();
    injectManualEditor();
  });

  /* ─── UI注入 ─────────────────────────────── */

  function injectModeToggle() {
    var genCard = null;
    document.querySelectorAll('#tab-post .card .card-title').forEach(function(el) {
      if (el.textContent.includes('記事生成')) genCard = el.closest('.card');
    });
    if (!genCard) return;

    var toggleHtml = `
      <div id="modeToggleWrap" style="display:flex;gap:8px;margin-bottom:14px">
        <button id="modeAiBtn" onclick="setMode('ai')"
          style="flex:1;padding:10px;border-radius:8px;border:2px solid var(--am);background:var(--am);color:#000;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;transition:all .15s">
          🤖 AI生成
        </button>
        <button id="modeManualBtn" onclick="setMode('manual')"
          style="flex:1;padding:10px;border-radius:8px;border:2px solid var(--bd);background:transparent;color:var(--mu);font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;transition:all .15s">
          ✏️ 手動入力
        </button>
      </div>
    `;

    var genBtn = genCard.querySelector('#genBtn');
    if (genBtn) genBtn.insertAdjacentHTML('beforebegin', toggleHtml);
  }

  function injectManualEditor() {
    var genCard = null;
    document.querySelectorAll('#tab-post .card .card-title').forEach(function(el) {
      if (el.textContent.includes('記事生成')) genCard = el.closest('.card');
    });
    if (!genCard) return;

    var manualHtml = `
      <div id="manualEditorWrap" style="display:none;margin-top:8px">

        <!-- タイトル -->
        <div style="margin-bottom:10px">
          <span style="font-size:11px;color:var(--mu);font-weight:700;text-transform:uppercase;letter-spacing:.4px;display:block;margin-bottom:5px">記事タイトル</span>
          <input id="manualTitle" placeholder="例：【50%OFF】商品名が¥253"
            style="background:var(--s2);border:1px solid var(--bd);border-radius:8px;color:var(--tx);padding:10px 14px;font-size:13px;font-family:inherit;width:100%">
        </div>

        <!-- 価格ブロック挿入ボタン -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <span style="font-size:11px;font-weight:700;color:var(--mu);text-transform:uppercase;letter-spacing:.4px">本文HTML</span>
          <button onclick="insertPriceBlock()"
            style="background:rgba(255,153,0,.12);border:1px solid rgba(255,153,0,.3);color:var(--am);border-radius:6px;padding:5px 12px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">
            💰 価格ブロックを先頭に挿入
          </button>
        </div>

        <!-- 本文テキストエリア -->
        <textarea id="manualBody" rows="14"
          placeholder="ここに本文HTMLを入力、またはコピペしてください。&#10;「価格ブロックを挿入」で otk-deal-summary ブロックを自動生成できます。"
          oninput="updManualCount()"
          style="background:var(--s2);border:1px solid var(--bd);border-radius:8px;color:var(--tx);padding:12px 14px;font-size:12px;font-family:Menlo,Monaco,monospace;line-height:1.7;width:100%;resize:vertical;min-height:240px;margin-bottom:6px"></textarea>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px">
          <span id="manualCharCount" style="font-size:11px;color:var(--mu)">0文字</span>
          <span style="font-size:11px;color:var(--mu)">直接編集 or 他ツールからコピペ</span>
        </div>

        <!-- スニペット挿入 -->
        <div style="margin-bottom:14px">
          <span style="font-size:11px;color:var(--mu);font-weight:700;display:block;margin-bottom:6px">よく使う要素を挿入</span>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button onclick="insertSnippet('lead')"    class="snp-btn">リード文</button>
            <button onclick="insertSnippet('section')" class="snp-btn">セクションタイトル</button>
            <button onclick="insertSnippet('ul')"      class="snp-btn">箇条書き</button>
            <button onclick="insertSnippet('amzBtn')"  class="snp-btn">Amazonボタン</button>
            <button onclick="insertSnippet('note')"    class="snp-btn">補足ボックス</button>
            <button onclick="insertSnippet('disc')"    class="snp-btn">免責文</button>
          </div>
        </div>

        <!-- 記事を作成ボタン -->
        <button id="manualGenBtn" onclick="buildManualArticle()"
          style="width:100%;padding:13px;background:var(--am);color:#000;font-weight:700;font-size:14px;border-radius:8px;border:none;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px">
          ✏️ 記事を作成して下に表示
        </button>
      </div>

      <style>
        .snp-btn{background:var(--s2);border:1px solid var(--bd);color:var(--mu);border-radius:6px;padding:5px 10px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s}
        .snp-btn:hover{border-color:var(--am);color:var(--am)}
      </style>
    `;

    var genBtn = genCard.querySelector('#genBtn');
    if (genBtn) genBtn.insertAdjacentHTML('afterend', manualHtml);
  }

  /* ─── モード切替 ─────────────────────────── */

  window.setMode = function(mode) {
    var aiBtn      = document.getElementById('modeAiBtn');
    var manualBtn  = document.getElementById('modeManualBtn');
    var genBtn     = document.getElementById('genBtn');
    var manualWrap = document.getElementById('manualEditorWrap');

    if (mode === 'ai') {
      aiBtn.style.background   = 'var(--am)';
      aiBtn.style.color        = '#000';
      aiBtn.style.borderColor  = 'var(--am)';
      manualBtn.style.background  = 'transparent';
      manualBtn.style.color       = 'var(--mu)';
      manualBtn.style.borderColor = 'var(--bd)';
      genBtn.style.display     = 'flex';
      manualWrap.style.display = 'none';
    } else {
      manualBtn.style.background  = 'var(--am)';
      manualBtn.style.color       = '#000';
      manualBtn.style.borderColor = 'var(--am)';
      aiBtn.style.background   = 'transparent';
      aiBtn.style.color        = 'var(--mu)';
      aiBtn.style.borderColor  = 'var(--bd)';
      genBtn.style.display     = 'none';
      manualWrap.style.display = 'block';
      autoFillTitle();
    }
  };

  /* ─── タイトル自動補完 ─────────────────────── */

  function autoFillTitle() {
    var titleEl = document.getElementById('manualTitle');
    if (!titleEl || titleEl.value.trim()) return;
    var name = (document.getElementById('qName').value || '').trim();
    var sale = parseFloat(document.getElementById('qSale').value) || 0;
    var orig = parseFloat(document.getElementById('qOrig').value) || 0;
    var disc = (orig > 0 && sale < orig) ? Math.round((1 - sale / orig) * 100) : 0;
    if (name && sale) {
      var compact = name.length > 24 ? name.slice(0, 24) + '...' : name;
      titleEl.value = '【' + (disc > 0 ? disc + '%OFF' : 'セール') + '】' + compact + 'が¥' + fmt(sale);
    }
  }

  /* ─── ヘルパー ───────────────────────────── */

  function fmt(n) {
    return window.fmt ? window.fmt(n) : Number(n).toLocaleString('ja-JP');
  }

  function getAssocId() {
    var el = document.getElementById('assocId');
    return el ? (el.value.trim() || 'popo1215-22') : 'popo1215-22';
  }

  function getCurrentAsin() {
    var urlEl = document.getElementById('qUrl');
    return urlEl && window.getAsin ? window.getAsin(urlEl.value) : null;
  }

  function getLink(asin) {
    return asin ? 'https://www.amazon.co.jp/dp/' + asin + '?tag=' + getAssocId() : '#';
  }

  function getSelectedBadgeLabel() {
    var btn = document.querySelector('.pp-badge-btn.selected');
    return btn ? (btn.dataset.label || 'SALE') : 'SALE';
  }

  // premium-dropin.js と同じ Amazonボタン
  function amazonButton(link) {
    return '<a class="otk-amazon-btn" href="' + link + '" target="_blank" rel="noopener sponsored" style="display:inline-flex;align-items:center;justify-content:center;gap:9px;background:linear-gradient(180deg,#ffb84d 0%,#ff9900 100%);color:#171717;font-weight:800;text-decoration:none;border-radius:9px;padding:13px 24px;box-shadow:0 12px 24px rgba(255,153,0,.25);border:1px solid rgba(180,83,9,.20);letter-spacing:.01em;min-width:230px"><span style="font-size:15px">Amazonでセール価格を確認</span><span aria-hidden="true" style="font-size:16px;line-height:1">→</span></a>';
  }

  // premium-dropin.js と同じセクションタイトル
  function sectionTitle(text) {
    return '<div class="otk-section-title" style="margin:30px 0 14px;padding:11px 14px;border-left:4px solid #4d8dcc;background:#f7f9fc;color:#263a66;font-size:19px;line-height:1.45;font-weight:800">' + text + '</div>';
  }

  /* ─── 価格ブロック生成（otk-deal-summary デザイン） ─── */

  function buildPriceBlock() {
    var sale = parseFloat(document.getElementById('qSale').value) || 0;
    var orig = parseFloat(document.getElementById('qOrig').value) || 0;
    var pt   = parseFloat(document.getElementById('qPoint').value) || 0;
    var note = (document.getElementById('qNote').value || '').trim();
    var asin = getCurrentAsin();
    var link = getLink(asin);

    if (!sale) return null;

    var disc  = (orig > 0 && sale < orig) ? Math.round((1 - sale / orig) * 100) : 0;
    var save  = (orig > 0 && sale < orig) ? orig - sale : 0;
    var eff   = pt > 0 ? sale - pt : null;
    var badge = getSelectedBadgeLabel();

    var origLine = orig > 0
      ? '<span style="color:#7b8190;text-decoration:line-through;margin-left:8px">¥' + fmt(orig) + '</span>'
      : '';
    var saveLine = save > 0
      ? '<div style="font-size:13px;color:#00856f;font-weight:700;margin-top:6px">¥' + fmt(save) + 'お得 / ' + disc + '%OFF</div>'
      : '';
    var pointLine = pt > 0
      ? '<li><strong>ポイント還元</strong><span>' + fmt(pt) + 'pt / 実質¥' + fmt(eff) + '</span></li>'
      : '';
    var noteLine = note
      ? '\n\n<p class="otk-sale-note"><strong>補足:</strong> ' + note + '</p>'
      : '';

    var block =
      '<div class="otk-deal-summary" style="border:1px solid #e8ebf2;border-radius:12px;background:#fff;padding:20px 22px;margin:20px 0 24px;box-shadow:0 10px 26px rgba(21,26,36,.04)">' +
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap">' +
          '<div>' +
            '<div style="display:inline-block;background:#e53935;color:#fff;font-size:12px;font-weight:700;border-radius:999px;padding:3px 10px;margin-bottom:8px">' + badge + '</div>' +
            '<div style="font-size:32px;line-height:1.12;color:#e53935;font-weight:900;letter-spacing:.01em">¥' + fmt(sale) + origLine + '</div>' +
            saveLine +
          '</div>' +
          '<p style="margin:4px 0 0">' + amazonButton(link) + '</p>' +
        '</div>' +
        '<ul class="otk-deal-facts" style="list-style:none;padding:14px 0 0;margin:14px 0 0;border-top:1px solid #edf0f5">' +
          '<li><strong>セール価格</strong><span>¥' + fmt(sale) + '</span></li>' +
          (orig > 0 ? '<li><strong>通常価格</strong><span>¥' + fmt(orig) + '</span></li>' : '') +
          (disc > 0 ? '<li><strong>割引</strong><span>' + disc + '%OFF / ¥' + fmt(save) + 'お得</span></li>' : '') +
          pointLine +
          (asin ? '<li><strong>ASIN</strong><span>' + asin + '</span></li>' : '') +
        '</ul>' +
      '</div>' +
      noteLine;

    return block;
  }

  /* ─── 価格ブロック挿入 ───────────────────── */

  window.insertPriceBlock = function() {
    var block = buildPriceBlock();
    if (!block) { alert('先に「ご請求額」を入力してください。'); return; }
    var ta = document.getElementById('manualBody');
    if (ta) {
      ta.value = block + '\n\n' + ta.value;
      updManualCount();
      toast('💰 価格ブロックを先頭に挿入しました！');
    }
  };

  /* ─── スニペット挿入 ─────────────────────── */

  window.insertSnippet = function(type) {
    var ta = document.getElementById('manualBody');
    if (!ta) return;
    var asin = getCurrentAsin();
    var link = getLink(asin);

    var snippets = {
      lead:
        '<p class="otk-lead">（商品名、価格、割引率、向いている人が一文で伝わるリード文。90〜130文字）</p>\n\n',

      section:
        sectionTitle('セクションタイトル') + '\n<p>本文をここに入力してください。</p>\n\n',

      ul:
        '<ul>\n  <li>項目1</li>\n  <li>項目2</li>\n  <li>項目3</li>\n</ul>\n\n',

      amzBtn:
        '<p style="text-align:center;margin:26px 0">' + amazonButton(link) + '</p>\n\n',

      note:
        '<p class="otk-sale-note"><strong>補足:</strong> ここに補足情報を入力してください。</p>\n\n',

      disc:
        '<p style="font-size:12px;color:#777;line-height:1.7">※価格・在庫・ポイント還元は記事作成時点の情報です。最新情報はAmazonの商品ページでご確認ください。この記事にはアフィリエイトリンクを含みます。</p>\n\n'
    };

    var snippet = snippets[type] || '';
    var pos = ta.selectionStart || ta.value.length;
    ta.value = ta.value.slice(0, pos) + snippet + ta.value.slice(pos);
    ta.selectionStart = ta.selectionEnd = pos + snippet.length;
    ta.focus();
    updManualCount();
  };

  /* ─── 文字数カウント ─────────────────────── */

  window.updManualCount = function() {
    var ta = document.getElementById('manualBody');
    var el = document.getElementById('manualCharCount');
    if (ta && el) el.textContent = ta.value.length + '文字';
  };

  /* ─── 手動記事ビルド ─────────────────────── */

  window.buildManualArticle = function() {
    var titleEl = document.getElementById('manualTitle');
    var bodyEl  = document.getElementById('manualBody');
    var title   = titleEl ? titleEl.value.trim() : '';
    var body    = bodyEl  ? bodyEl.value.trim()  : '';

    if (!body) { toast('本文を入力してください', 1); return; }

    var sale  = parseFloat(document.getElementById('qSale').value) || 0;
    var orig  = parseFloat(document.getElementById('qOrig').value) || 0;
    var pt    = parseFloat(document.getElementById('qPoint').value) || 0;
    var name  = (document.getElementById('qName').value || '').trim();
    var note  = (document.getElementById('qNote').value || '').trim();
    var asin  = getCurrentAsin();
    var link  = getLink(asin);
    var disc  = (orig > 0 && sale < orig) ? Math.round((1 - sale / orig) * 100) : 0;
    var save  = (orig > 0 && sale < orig) ? orig - sale : 0;
    var eff   = pt > 0 ? sale - pt : null;
    var thumbEl   = document.getElementById('thumbImg');
    var manualUrl = ((document.getElementById('qImgUrl') || {}).value || '').trim();
    var iUrl = (thumbEl && thumbEl.dataset.localSet === '1') ? thumbEl.src
             : (manualUrl || (asin ? 'https://images-na.ssl-images-amazon.com/images/P/' + asin + '.jpg' : ''));

    // blOut に反映
    document.getElementById('blOut').textContent  = body;
    document.getElementById('blCard').style.display = 'block';
    document.getElementById('blCount').textContent = body.length + '文字';

    // X投稿文（価格がある場合）
    if (sale > 0) {
      var twText =
        '【' + (disc > 0 ? disc + '%OFF🔥' : 'セール🔥') + '】' +
        (name ? name.slice(0, 20) : 'Amazon商品') + '\n' +
        (orig > 0 ? '¥' + fmt(orig) + '→ ' : '') +
        '¥' + fmt(sale) + (save > 0 ? '（¥' + fmt(save) + 'お得！）' : '') + '\n' +
        (eff ? '💡実質¥' + fmt(eff) + '（' + fmt(pt) + 'pt還元）\n' : '') +
        (note ? note + '\n' : '') +
        '\n' + link + '\n#ad';
      document.getElementById('twOut').textContent = twText;
      document.getElementById('twCard').style.display = 'block';
      if (window.updTw) window.updTw();
    }

    // cur をセット（WordPress投稿・ストックに必要）
    window.cur = {
      asin:      asin,
      name:      name,
      orig:      orig,
      sale:      sale,
      disc:      disc,
      save:      save,
      pt:        pt,
      eff:       eff,
      link:      link,
      iUrl:      iUrl,
      note:      note,
      cat:       'セール情報',
      badge:     getSelectedBadgeLabel(),
      postTitle: title || ('【' + (disc > 0 ? disc + '%OFF' : 'セール') + '】' + name),
      date:      new Date().toLocaleDateString('ja-JP')
    };

    if (window.autoSaveArticle) window.autoSaveArticle(window.cur, body);

    toast('✅ 記事を作成しました！');
    document.getElementById('blCard').scrollIntoView({ behavior: 'smooth' });
  };

  /* ─── toast ─────────────────────────────── */

  function toast(msg, err) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.style.background = err ? '#ff4d6d' : '#00d68f';
    t.style.color = err ? '#fff' : '#000';
    t.classList.add('show');
    setTimeout(function() { t.classList.remove('show'); }, 3000);
  }

})();
