/*
 * 手動入力モード追加ドロップイン
 * index.html の </body> 直前に以下を追加:
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
    var genCard = document.querySelector('#tab-post .card:has(#genBtn)');
    if (!genCard) {
      // :has() 非対応ブラウザ向け fallback
      var btns = document.querySelectorAll('#tab-post .card .card-title');
      btns.forEach(function(el) {
        if (el.textContent.includes('記事生成')) genCard = el.closest('.card');
      });
    }
    if (!genCard) return;

    // モード切替ボタンを挿入
    var toggleHtml = `
      <div id="modeToggleWrap" style="display:flex;gap:8px;margin-bottom:14px">
        <button id="modeAiBtn"
          onclick="setMode('ai')"
          style="flex:1;padding:10px;border-radius:8px;border:2px solid var(--am);background:var(--am);color:#000;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;transition:all .15s">
          🤖 AI生成
        </button>
        <button id="modeManualBtn"
          onclick="setMode('manual')"
          style="flex:1;padding:10px;border-radius:8px;border:2px solid var(--bd);background:transparent;color:var(--mu);font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;transition:all .15s">
          ✏️ 手動入力
        </button>
      </div>
    `;

    var genBtn = genCard.querySelector('#genBtn');
    if (genBtn) {
      genBtn.insertAdjacentHTML('beforebegin', toggleHtml);
    }
  }

  function injectManualEditor() {
    var genCard = null;
    var btns = document.querySelectorAll('#tab-post .card .card-title');
    btns.forEach(function(el) {
      if (el.textContent.includes('記事生成')) genCard = el.closest('.card');
    });
    if (!genCard) return;

    var manualHtml = `
      <div id="manualEditorWrap" style="display:none;margin-top:8px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <span style="font-size:11px;font-weight:700;color:var(--mu);text-transform:uppercase;letter-spacing:.4px">本文を手動で入力</span>
          <button onclick="insertPriceBlock()"
            style="background:rgba(255,153,0,.12);border:1px solid rgba(255,153,0,.3);color:var(--am);border-radius:6px;padding:5px 12px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">
            💰 価格ブロックを挿入
          </button>
        </div>

        <!-- タイトル -->
        <div style="margin-bottom:10px">
          <span style="font-size:11px;color:var(--mu);font-weight:700;text-transform:uppercase;letter-spacing:.4px;display:block;margin-bottom:5px">記事タイトル</span>
          <input id="manualTitle" placeholder="例：【50%OFF】商品名が¥1,999"
            style="background:var(--s2);border:1px solid var(--bd);border-radius:8px;color:var(--tx);padding:10px 14px;font-size:13px;font-family:inherit;width:100%">
        </div>

        <!-- 本文エディタ -->
        <div style="margin-bottom:10px">
          <span style="font-size:11px;color:var(--mu);font-weight:700;text-transform:uppercase;letter-spacing:.4px;display:block;margin-bottom:5px">
            本文HTML
            <span style="font-weight:400;text-transform:none;letter-spacing:0;margin-left:6px">※ WordPress用HTMLを直接入力</span>
          </span>
          <textarea id="manualBody" rows="14"
            placeholder="ここに本文HTMLを入力してください。&#10;&#10;例：&#10;&lt;p&gt;今だけ50%OFFで購入できます。&lt;/p&gt;&#10;&lt;h2&gt;おすすめポイント&lt;/h2&gt;&#10;&lt;ul&gt;&#10;  &lt;li&gt;ポイント1&lt;/li&gt;&#10;  &lt;li&gt;ポイント2&lt;/li&gt;&#10;&lt;/ul&gt;"
            oninput="updManualCount()"
            style="background:var(--s2);border:1px solid var(--bd);border-radius:8px;color:var(--tx);padding:12px 14px;font-size:12px;font-family:Menlo,Monaco,monospace;line-height:1.7;width:100%;resize:vertical;min-height:240px"></textarea>
          <div style="display:flex;justify-content:space-between;margin-top:4px">
            <span id="manualCharCount" style="font-size:11px;color:var(--mu)">0文字</span>
            <span style="font-size:11px;color:var(--mu)">直接編集 or 他ツールからコピペ</span>
          </div>
        </div>

        <!-- よく使うHTMLスニペット -->
        <div style="margin-bottom:14px">
          <span style="font-size:11px;color:var(--mu);font-weight:700;display:block;margin-bottom:6px">よく使う要素を挿入</span>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button onclick="insertSnippet('h2')" class="snippet-btn">H2見出し</button>
            <button onclick="insertSnippet('p')" class="snippet-btn">段落</button>
            <button onclick="insertSnippet('ul')" class="snippet-btn">箇条書き</button>
            <button onclick="insertSnippet('amzBtn')" class="snippet-btn">Amazonボタン</button>
            <button onclick="insertSnippet('note')" class="snippet-btn">注意書き</button>
            <button onclick="insertSnippet('disc')" class="snippet-btn">免責</button>
          </div>
        </div>

        <style>
          .snippet-btn {
            background: var(--s2);
            border: 1px solid var(--bd);
            color: var(--mu);
            border-radius: 6px;
            padding: 5px 10px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            font-family: inherit;
            transition: all .15s;
          }
          .snippet-btn:hover {
            border-color: var(--am);
            color: var(--am);
          }
        </style>

        <!-- 手動生成ボタン -->
        <button id="manualGenBtn" onclick="buildManualArticle()"
          style="width:100%;padding:13px;background:var(--am);color:#000;font-weight:700;font-size:14px;border-radius:8px;border:none;cursor:pointer;font-family:inherit;transition:all .15s;display:flex;align-items:center;justify-content:center;gap:8px">
          ✏️ 記事を作成して下に表示
        </button>
      </div>
    `;

    var genBtn = genCard.querySelector('#genBtn');
    if (genBtn) {
      genBtn.insertAdjacentHTML('afterend', manualHtml);
    }
  }

  /* ─── モード切替 ─────────────────────────── */

  window.setMode = function(mode) {
    var aiBtn     = document.getElementById('modeAiBtn');
    var manualBtn = document.getElementById('modeManualBtn');
    var genBtn    = document.getElementById('genBtn');
    var manualWrap = document.getElementById('manualEditorWrap');

    if (mode === 'ai') {
      aiBtn.style.background    = 'var(--am)';
      aiBtn.style.color         = '#000';
      aiBtn.style.borderColor   = 'var(--am)';
      manualBtn.style.background  = 'transparent';
      manualBtn.style.color       = 'var(--mu)';
      manualBtn.style.borderColor = 'var(--bd)';
      genBtn.style.display    = 'flex';
      manualWrap.style.display = 'none';
    } else {
      manualBtn.style.background  = 'var(--am)';
      manualBtn.style.color       = '#000';
      manualBtn.style.borderColor = 'var(--am)';
      aiBtn.style.background    = 'transparent';
      aiBtn.style.color         = 'var(--mu)';
      aiBtn.style.borderColor   = 'var(--bd)';
      genBtn.style.display    = 'none';
      manualWrap.style.display = 'block';

      // タイトルを自動生成
      autoFillTitle();
    }
  };

  /* ─── タイトル自動補完 ─────────────────────── */

  function autoFillTitle() {
    var titleEl = document.getElementById('manualTitle');
    if (!titleEl || titleEl.value.trim()) return;

    var urlEl  = document.getElementById('qUrl');
    var nameEl = document.getElementById('qName');
    var saleEl = document.getElementById('qSale');
    var origEl = document.getElementById('qOrig');

    var asin = urlEl ? (getAsin ? getAsin(urlEl.value) : null) : null;
    var name = nameEl ? nameEl.value.trim() : '';
    var sale = parseFloat(saleEl ? saleEl.value : 0) || 0;
    var orig = parseFloat(origEl ? origEl.value : 0) || 0;
    var disc = (orig > 0 && sale < orig) ? Math.round((1 - sale / orig) * 100) : 0;

    if (name && sale) {
      var prefix = disc > 0 ? '【' + disc + '%OFF】' : '【セール】';
      var compact = name.length > 24 ? name.slice(0, 24) + '...' : name;
      titleEl.value = prefix + compact + 'が¥' + Number(sale).toLocaleString('ja-JP');
    }
  }

  /* ─── 価格ブロック挿入 ───────────────────── */

  window.insertPriceBlock = function() {
    var saleEl  = document.getElementById('qSale');
    var origEl  = document.getElementById('qOrig');
    var ptEl    = document.getElementById('qPoint');
    var urlEl   = document.getElementById('qUrl');
    var nameEl  = document.getElementById('qName');
    var assocEl = document.getElementById('assocId');

    var sale = parseFloat(saleEl ? saleEl.value : 0) || 0;
    var orig = parseFloat(origEl ? origEl.value : 0) || 0;
    var pt   = parseFloat(ptEl   ? ptEl.value   : 0) || 0;
    var name = nameEl ? nameEl.value.trim() : '';
    var assocId = assocEl ? (assocEl.value.trim() || 'popo1215-22') : 'popo1215-22';

    if (!sale) {
      alert('先に「ご請求額」を入力してください。');
      return;
    }

    var asin = urlEl && window.getAsin ? getAsin(urlEl.value) : '';
    var link = asin ? 'https://www.amazon.co.jp/dp/' + asin + '?tag=' + assocId : '#';
    var disc = (orig > 0 && sale < orig) ? Math.round((1 - sale / orig) * 100) : 0;
    var save = (orig > 0 && sale < orig) ? orig - sale : 0;
    var eff  = pt > 0 ? sale - pt : null;
    var fmt  = window.fmt || function(n) { return Number(n).toLocaleString('ja-JP'); };

    var badge = (function() {
      var sel = document.querySelector('.pp-badge-btn.selected');
      return sel ? (sel.dataset.label || 'SALE') : 'SALE';
    })();

    var block =
      '<div style="background:linear-gradient(135deg,#fff5f5,#fff0f0);border:2px solid #e53935;border-radius:12px;padding:20px 24px;margin:16px 0">' +
        '<p style="margin:0 0 6px">' +
          '<span style="background:#e53935;color:#fff;font-weight:bold;padding:4px 14px;border-radius:20px;font-size:13px;margin-right:10px">' + badge + '</span>' +
          '<span style="font-size:28px;font-weight:800;color:#e53935">¥' + fmt(sale) + '</span>' +
        '</p>' +
        (orig > 0 ?
          '<p style="margin:4px 0 0;font-size:14px">' +
            '<span style="color:#999;text-decoration:line-through">¥' + fmt(orig) + '</span>' +
            (save > 0 ? '<span style="color:#00897b;font-weight:bold;margin-left:8px">¥' + fmt(save) + 'お得！</span>' : '') +
          '</p>' : '') +
      '</div>' +
      (pt > 0 && eff ?
        '<div style="background:linear-gradient(135deg,#e8f5e9,#f3faf7);border:2px solid #00897b;border-radius:12px;padding:18px 22px;margin:16px 0">' +
          '<p style="margin:0 0 8px;font-size:14px;color:#333">🪙 <strong>獲得ポイント</strong>: <span style="color:#FF9900;font-weight:bold;font-size:20px">+' + fmt(pt) + 'pt</span></p>' +
          '<p style="margin:0;padding-top:10px;border-top:1px solid #b2dfdb;font-size:14px;color:#333">実質価格: <strong style="font-size:24px;color:#e53935">¥' + fmt(eff) + '</strong></p>' +
        '</div>' : '') +
      '<div style="text-align:center;margin:20px 0">' +
        '<a href="' + link + '" target="_blank" rel="noopener" style="display:inline-block;background:linear-gradient(135deg,#ff9900,#ffad33);color:#fff;font-weight:bold;font-size:16px;padding:16px 40px;border-radius:10px;text-decoration:none;box-shadow:0 4px 12px rgba(255,153,0,0.3)">🛒 Amazonで今すぐチェック →</a>' +
      '</div>';

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

    var urlEl   = document.getElementById('qUrl');
    var assocEl = document.getElementById('assocId');
    var asin    = urlEl && window.getAsin ? getAsin(urlEl.value) : '';
    var assocId = assocEl ? (assocEl.value.trim() || 'popo1215-22') : 'popo1215-22';
    var link    = asin ? 'https://www.amazon.co.jp/dp/' + asin + '?tag=' + assocId : '#';

    var snippets = {
      h2:     '<h2>見出しテキスト</h2>\n',
      p:      '<p>段落テキストをここに入力してください。</p>\n',
      ul:     '<ul>\n  <li>項目1</li>\n  <li>項目2</li>\n  <li>項目3</li>\n</ul>\n',
      amzBtn: '<div style="text-align:center;margin:24px 0"><a href="' + link + '" target="_blank" rel="noopener" style="display:inline-block;background:linear-gradient(135deg,#ff9900,#ffad33);color:#fff;font-weight:bold;font-size:16px;padding:16px 40px;border-radius:10px;text-decoration:none;box-shadow:0 4px 12px rgba(255,153,0,0.3)">🛒 Amazonでセール価格を確認する →</a></div>\n',
      note:   '<div style="background:#fff8ed;border-left:4px solid #ff9900;border-radius:0 8px 8px 0;padding:12px 16px;margin:16px 0"><strong>📌 補足：</strong>ここに注意事項や補足情報を入力してください。</div>\n',
      disc:   '<p style="font-size:12px;color:#777;line-height:1.7">※価格・在庫・ポイント還元は記事作成時点の情報です。最新情報はAmazonの商品ページでご確認ください。この記事にはアフィリエイトリンクを含みます。</p>\n'
    };

    var snippet = snippets[type] || '';
    if (!snippet) return;

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

    if (!body) {
      toast('本文を入力してください', 1);
      return;
    }

    // X用投稿文も自動生成
    var saleEl  = document.getElementById('qSale');
    var origEl  = document.getElementById('qOrig');
    var ptEl    = document.getElementById('qPoint');
    var urlEl   = document.getElementById('qUrl');
    var nameEl  = document.getElementById('qName');
    var noteEl  = document.getElementById('qNote');
    var assocEl = document.getElementById('assocId');

    var sale    = parseFloat(saleEl ? saleEl.value : 0) || 0;
    var orig    = parseFloat(origEl ? origEl.value : 0) || 0;
    var pt      = parseFloat(ptEl   ? ptEl.value   : 0) || 0;
    var name    = nameEl ? nameEl.value.trim()    : '';
    var note    = noteEl ? noteEl.value.trim()    : '';
    var assocId = assocEl ? (assocEl.value.trim() || 'popo1215-22') : 'popo1215-22';
    var fmt     = window.fmt || function(n) { return Number(n).toLocaleString('ja-JP'); };

    var asin = urlEl && window.getAsin ? getAsin(urlEl.value) : '';
    var link = asin ? 'https://www.amazon.co.jp/dp/' + asin + '?tag=' + assocId : '#';
    var disc = (orig > 0 && sale < orig) ? Math.round((1 - sale / orig) * 100) : 0;
    var save = (orig > 0 && sale < orig) ? orig - sale : 0;
    var eff  = pt > 0 ? sale - pt : null;

    // blOut に反映
    document.getElementById('blOut').textContent  = body;
    document.getElementById('blCard').style.display = 'block';
    document.getElementById('blCount').textContent = body.length + '文字';

    // twOut にシンプルなX投稿文を入れる（sale があれば）
    if (sale > 0) {
      var twText =
        '【' + (disc > 0 ? disc + '%OFF🔥' : 'セール🔥') + '】' + (name ? name.slice(0, 20) : 'Amazon商品') + '\n' +
        (orig > 0 ? '¥' + fmt(orig) + '→ ' : '') + '¥' + fmt(sale) + (save > 0 ? '（¥' + fmt(save) + 'お得！）' : '') + '\n' +
        (eff ? '💡実質¥' + fmt(eff) + '（' + fmt(pt) + 'pt還元）\n' : '') +
        (note ? note + '\n' : '') +
        '\n' + link + '\n#ad';
      document.getElementById('twOut').textContent = twText;
      document.getElementById('twCard').style.display = 'block';
      if (window.updTw) updTw();
    }

    // cur をセット（WordPress投稿に必要）
    var thumbEl = document.getElementById('thumbImg');
    var manualUrl = (document.getElementById('qImgUrl') ? document.getElementById('qImgUrl').value : '') || '';
    window.cur = {
      asin:     asin,
      name:     name,
      orig:     orig,
      sale:     sale,
      disc:     disc,
      save:     save,
      pt:       pt,
      eff:      eff,
      link:     link,
      iUrl:     (thumbEl && thumbEl.dataset.localSet === '1') ? thumbEl.src : (manualUrl || (asin ? 'https://images-na.ssl-images-amazon.com/images/P/' + asin + '.jpg' : '')),
      note:     note,
      cat:      'セール情報',
      postTitle: title || ('【' + (disc > 0 ? disc + '%OFF' : 'セール') + '】' + name),
      date:     new Date().toLocaleDateString('ja-JP')
    };

    // ストックに自動保存
    if (window.autoSaveArticle) autoSaveArticle(window.cur, body);

    toast('✅ 記事を作成しました！');
    document.getElementById('blCard').scrollIntoView({ behavior: 'smooth' });
  };

  /* ─── toast ヘルパー ─────────────────────── */

  function toast(msg, err) {
    if (window.toast && window.toast.call) return;
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.style.background = err ? '#ff4d6d' : '#00d68f';
    t.style.color = err ? '#fff' : '#000';
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 3000);
  }

})();
