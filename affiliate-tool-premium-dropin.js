/*
 * Premium article template override.
 * Load after the original script:
 * <script src="./affiliate-tool-premium-dropin.js?v=20260511"></script>
 */
(function () {
  'use strict';

  function safeText(value) {
    return String(value || '').replace(/[<>]/g, '').trim();
  }

  function attr(value) {
    return String(value || '').replace(/[&<>"']/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function titleFor(p) {
    var prefix = p.disc > 0 ? p.disc + '%OFF' : 'セール';
    return '【' + prefix + '】' + compactProductName(p.name || 'Amazonセール対象商品') + 'が' + yen(p.sale);
  }

  function yen(n) {
    return '¥' + fmt(n);
  }

  function compactProductName(name) {
    var s = String(name || '')
      .replace(/\s+/g, ' ')
      .replace(/[【】\[\]「」]/g, '')
      .replace(/\bAmazon(?:\.co\.jp)?\b/ig, '')
      .replace(/\bSALE\b/ig, '')
      .trim();

    var cutMarks = [' の ', ' with ', ' - ', '｜', '|', '／', '/', ','];
    for (var i = 0; i < cutMarks.length; i++) {
      var idx = s.indexOf(cutMarks[i]);
      if (idx > 10) {
        s = s.slice(0, idx);
        break;
      }
    }

    return s.length > 28 ? s.slice(0, 28) + '...' : s;
  }

  function amazonButton(url, label) {
    return '<a class="otk-amazon-btn" href="' + url + '" target="_blank" rel="noopener sponsored" style="display:inline-flex;align-items:center;justify-content:center;gap:9px;background:linear-gradient(180deg,#ffb84d 0%,#ff9900 100%);color:#171717;font-weight:800;text-decoration:none;border-radius:9px;padding:13px 24px;box-shadow:0 12px 24px rgba(255,153,0,.25);border:1px solid rgba(180,83,9,.20);letter-spacing:.01em;min-width:230px"><span style="font-size:15px">Amazonでセール価格を確認</span><span aria-hidden="true" style="font-size:16px;line-height:1">→</span></a>';
  }

  function sectionTitle(text) {
    return '<div class="otk-section-title" style="margin:30px 0 14px;padding:11px 14px;border-left:4px solid #4d8dcc;background:#f7f9fc;color:#263a66;font-size:19px;line-height:1.45;font-weight:800">' + text + '</div>';
  }

  function disclosureLabel() {
    return '<div class="otk-pr-disclosure" style="display:flex;align-items:flex-start;gap:8px;border:1px solid #f3d6a3;background:#fff8ea;color:#5c3b00;border-radius:10px;padding:10px 12px;margin:0 0 16px;font-size:13px;line-height:1.65">' +
      '<span style="display:inline-flex;align-items:center;justify-content:center;min-width:42px;height:22px;border-radius:999px;background:#ff9900;color:#171717;font-size:11px;font-weight:800;letter-spacing:.04em">PR</span>' +
      '<span>この記事には広告・アフィリエイトリンクを含みます。掲載している価格や在庫状況は記事作成時点の情報です。</span>' +
      '</div>';
  }

  window.makeBl = function makeBl(p) {
    var title = titleFor(p);
    p.postTitle = title;

    var origLine = p.orig > 0
      ? '<span style="color:#7b8190;text-decoration:line-through;margin-left:8px">' + yen(p.orig) + '</span>'
      : '';

    var saveLine = p.save > 0
      ? '<div style="font-size:13px;color:#00856f;font-weight:700;margin-top:6px">' + yen(p.save) + 'お得' + (p.disc > 0 ? ' / ' + p.disc + '%OFF' : '') + '</div>'
      : '';

    var pointLine = p.pt > 0
      ? '<li><strong>ポイント還元</strong><span>' + fmt(p.pt) + 'pt' + (p.eff ? ' / 実質' + yen(p.eff) : '') + '</span></li>'
      : '';

    var noteLine = p.note
      ? '<p class="otk-sale-note"><strong>補足:</strong> ' + safeText(p.note) + '</p>'
      : '';

    return callAI(
      'WordPress用のAmazonセール速報記事をHTMLで作成してください。Markdownは禁止。HTMLのみ出力してください。\n' +
      '\n【商品情報】\n' +
      'ASIN: ' + p.asin + '\n' +
      '商品名: ' + (p.name || '（ASINから推測）') + '\n' +
      'セール価格: ' + yen(p.sale) + '\n' +
      '参考価格: ' + (p.orig ? yen(p.orig) : '不明') + '\n' +
      '割引: ' + (p.disc > 0 ? p.disc + '%OFF' : '不明') + '\n' +
      'お得額: ' + (p.save > 0 ? yen(p.save) : '不明') + '\n' +
      'ポイント: ' + (p.pt > 0 ? fmt(p.pt) + 'pt' : 'なし') + '\n' +
      '実質価格: ' + (p.eff ? yen(p.eff) : 'なし') + '\n' +
      'アフィリエイトリンク: ' + p.link + '\n' +
      '補足: ' + (p.note || 'なし') + '\n' +
      '\n【記事タイトル】\n' + title + '\n' +
      '\n【方針】\n' +
      '・本文に商品画像は入れない。WordPressのアイキャッチ画像と重複させない。\n' +
      '・レビュー、使ってみた、実感、検証など体験表現は禁止。\n' +
      '・セール速報として、価格、買い時、向いている人、注意点を短く整理する。\n' +
      '・記事冒頭に広告・アフィリエイトリンクを含むことが分かるPR表記を入れる。\n' +
      '・「適しています」「良好です」「対応できそう」など機械的な語尾を避ける。\n' +
      '・自然な文体の例: 「部活やキャンプ用の保冷バッグを探しているなら、候補に入れやすい価格です。」\n' +
      '・h2タグは絶対に使わない。見出しはdiv class="otk-section-title"を使う。\n' +
      '・見出しは「セールの要点」「どんな人におすすめ？」「購入前に確認したいこと」「まとめ」の4つだけ。\n' +
      '・煽りすぎず、メディア記事として自然に。\n' +
      '\n【以下のテンプレートの（）だけを自然な文章に置き換えて出力】\n' +
      disclosureLabel() + '\n\n' +
      '<p class="otk-lead">（商品名、価格、割引率、向いている人が一文で伝わるリード文。90〜130文字）</p>\n\n' +
      '<div class="otk-deal-summary" style="border:1px solid #e8ebf2;border-radius:12px;background:#fff;padding:20px 22px;margin:20px 0 24px;box-shadow:0 10px 26px rgba(21,26,36,.04)">' +
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap">' +
      '<div><div style="display:inline-block;background:#e53935;color:#fff;font-size:12px;font-weight:700;border-radius:999px;padding:3px 10px;margin-bottom:8px">' + (p.badge || 'SALE') + '</div>' +
      '<div style="font-size:32px;line-height:1.12;color:#e53935;font-weight:900;letter-spacing:.01em">' + yen(p.sale) + origLine + '</div>' + saveLine + '</div>' +
      '<p style="margin:4px 0 0">' + amazonButton(p.link) + '</p>' +
      '</div>' +
      '<ul class="otk-deal-facts" style="list-style:none;padding:14px 0 0;margin:14px 0 0;border-top:1px solid #edf0f5">' +
      '<li><strong>セール価格</strong><span>' + yen(p.sale) + '</span></li>' +
      (p.orig > 0 ? '<li><strong>通常価格</strong><span>' + yen(p.orig) + '</span></li>' : '') +
      (p.disc > 0 ? '<li><strong>割引</strong><span>' + p.disc + '%OFF' + (p.save > 0 ? ' / ' + yen(p.save) + 'お得' : '') + '</span></li>' : '') +
      pointLine +
      '<li><strong>ASIN</strong><span>' + p.asin + '</span></li>' +
      '</ul></div>\n\n' +
      noteLine + '\n\n' +
      sectionTitle('セールの要点') + '\n' +
      '<p>（今回の価格条件を2文で説明。数字を並べるだけでなく、なぜ見逃しにくい価格なのかも自然に触れる）</p>\n\n' +
      sectionTitle('どんな人におすすめ？') + '\n' +
      '<p>（この商品が合いそうな人を1文で説明。売り込みすぎず、用途が浮かぶ言い方にする）</p>\n' +
      '<ul>\n' +
      '<li>（おすすめ対象1を具体的に）</li>\n' +
      '<li>（おすすめ対象2を具体的に）</li>\n' +
      '<li>（おすすめ対象3を具体的に）</li>\n' +
      '</ul>\n\n' +
      sectionTitle('購入前に確認したいこと') + '\n' +
      '<ul>\n' +
      '<li>価格、在庫、ポイント還元は変動するため、購入前にAmazonの商品ページで最新条件を確認してください。</li>\n' +
      '<li>型番、サイズ、カラー、付属品が希望の商品と合っているか確認してください。</li>\n' +
      '<li>配送予定日や販売元はタイミングによって変わる場合があります。</li>\n' +
      '</ul>\n\n' +
      sectionTitle('まとめ') + '\n' +
      '<p>（価格メリットとおすすめ対象を2文で締める。「今すぐ買うべき」ではなく「候補に入れやすい」くらいの温度感にする）</p>\n\n' +
      '<p style="text-align:center;margin:26px 0">' + amazonButton(p.link) + '</p>\n' +
      '<p style="font-size:12px;color:#777;line-height:1.7">※価格・在庫・ポイント還元は記事作成時点の情報です。最新情報はAmazonの商品ページでご確認ください。</p>\n' +
      '\n【厳守ルール】HTMLのみ。h1、h2、h3、商品画像は出力しない。テンプレート外のセクションを追加しない。体験談は禁止。'
    , 2200);
  };

  var oldAutoSave = window.autoSaveArticle;
  window.autoSaveArticle = function autoSaveArticle(p, body) {
    p.postTitle = p.postTitle || titleFor(p);
    if (typeof oldAutoSave === 'function') return oldAutoSave(p, body);
  };

  if (window.USE_WORKER_WP_PROXY !== true) {
    window.postToWordPress = async function postToWordPress(status) {
      var s = getWpSettings();
      if (!s.url || !s.user || !s.pass) {
        toast('WordPress設定タブで接続情報を入力してください', 1);
        swTab('wp', document.getElementById('btn-wp'));
        return;
      }

      var body = document.getElementById('blOut').textContent;
      if (!body) {
        toast('先に記事を生成してください', 1);
        return;
      }
      if (!cur) {
        toast('商品情報がありません', 1);
        return;
      }

      var title = cur.postTitle || titleFor(cur);
      var btn = status === 'publish' ? document.getElementById('wpPublishBtn') : document.getElementById('wpPostBtn');
      btn.disabled = true;
      btn.innerHTML = '<span class="sp"></span>' + (status === 'publish' ? '公開中...' : '保存中...');

      try {
        toast('画像をアップロード中...');
        var featuredMediaId = await uploadImageToWP(cur.iUrl);
        var tagNames = (document.getElementById('qTags').value || '').split(',').map(function (t) { return t.trim(); }).filter(Boolean);
        var tagIds = await getOrCreateWpTags(tagNames);
        var catId = s.catMapping[cur.cat] || null;
        var postData = { title: title, content: body, status: status, excerpt: '' };
        if (featuredMediaId) postData.featured_media = featuredMediaId;
        if (tagIds.length) postData.tags = tagIds;
        if (catId) postData.categories = [catId];
        var r = await fetch(s.url + '/wp-json/wp/v2/posts', {
          method: 'POST',
          headers: { Authorization: getWpAuthHeader(), 'Content-Type': 'application/json' },
          body: JSON.stringify(postData)
        });
        var d = await r.json();
        if (!r.ok) throw new Error(d.message || r.status);
        toast('✅ WordPressに' + (status === 'publish' ? '公開' : '下書き保存') + 'しました！');
        if (d.link) window.open(status === 'publish' ? d.link : s.url + '/wp-admin/post.php?post=' + d.id + '&action=edit', '_blank');
      } catch (e) {
        toast('投稿失敗: ' + e.message, 1);
      } finally {
        btn.disabled = false;
        btn.innerHTML = status === 'publish' ? '🚀 WordPressに公開' : '📝 WordPressに下書き保存';
      }
    };
  }

  var style = document.createElement('style');
  style.textContent =
    '.entry-content .otk-pr-disclosure{box-shadow:0 6px 18px rgba(180,83,9,.05)}.entry-content .otk-deal-summary{overflow:hidden}.entry-content .otk-deal-facts li{display:flex;justify-content:space-between;gap:16px;padding:8px 0;border-bottom:1px solid #f0f2f6;line-height:1.55}.entry-content .otk-deal-facts li:last-child{border-bottom:0}.entry-content .otk-deal-facts strong{color:#39497a;font-weight:800}.entry-content .otk-deal-facts span{text-align:right;color:#20283a}.entry-content .otk-sale-note{border-left:4px solid #ff9900;background:#fff8ed;padding:10px 14px;border-radius:0 8px 8px 0;color:#544333;font-size:.92rem}.entry-content .otk-section-title{box-shadow:inset 0 -1px 0 rgba(77,141,204,.18)}.entry-content .otk-amazon-btn:hover{filter:brightness(1.03);transform:translateY(-1px);box-shadow:0 14px 28px rgba(255,153,0,.30)!important}.entry-content .otk-amazon-btn{transition:transform .16s ease,box-shadow .16s ease,filter .16s ease}.entry-content .otk-amazon-btn:visited{color:#171717}@media(max-width:600px){.entry-content .otk-pr-disclosure{font-size:12px}.entry-content .otk-deal-facts li{display:block}.entry-content .otk-deal-facts span{display:block;text-align:left;margin-top:2px}.entry-content .otk-amazon-btn{width:100%;min-width:0}}';
  document.head.appendChild(style);
})();
