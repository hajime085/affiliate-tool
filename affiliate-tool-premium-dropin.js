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
    return '【' + prefix + '】' + (p.name || 'Amazonセール対象商品');
  }

  function yen(n) {
    return '¥' + fmt(n);
  }

  function amazonButton(url, label) {
    return '<a class="otk-amazon-btn" href="' + url + '" target="_blank" rel="noopener sponsored" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(180deg,#ffb13b 0%,#ff9900 100%);color:#111827;font-weight:800;text-decoration:none;border-radius:10px;padding:13px 24px;box-shadow:0 10px 22px rgba(255,153,0,.24);border:1px solid rgba(180,83,9,.18);letter-spacing:.01em"><span style="font-size:15px">Amazonでセール価格を確認</span><span aria-hidden="true" style="font-size:16px;line-height:1">→</span></a>';
  }

  function sectionTitle(text) {
    return '<div class="otk-section-title" style="margin:28px 0 14px;padding:12px 14px;border-left:4px solid #4d8dcc;background:#f6f9fd;color:#263a66;font-size:20px;line-height:1.45;font-weight:800">' + text + '</div>';
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
      '・h2タグは絶対に使わない。見出しはdiv class="otk-section-title"を使う。\n' +
      '・見出しは「セールの要点」「どんな人におすすめ？」「購入前に確認したいこと」「まとめ」の4つだけ。\n' +
      '・煽りすぎず、メディア記事として自然に。\n' +
      '\n【以下のテンプレートの（）だけを自然な文章に置き換えて出力】\n' +
      '<p class="otk-lead">（商品名、価格、割引率、向いている人が一文で伝わるリード文。90〜130文字）</p>\n\n' +
      '<div class="otk-deal-summary" style="border:1px solid #e8ebf2;border-radius:12px;background:#fff;padding:18px 20px;margin:18px 0 22px">' +
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap">' +
      '<div><div style="display:inline-block;background:#e53935;color:#fff;font-size:12px;font-weight:700;border-radius:999px;padding:3px 10px;margin-bottom:8px">' + (p.badge || 'SALE') + '</div>' +
      '<div style="font-size:30px;line-height:1.15;color:#e53935;font-weight:800">' + yen(p.sale) + origLine + '</div>' + saveLine + '</div>' +
      '<p style="margin:4px 0 0">' + amazonButton(p.link) + '</p>' +
      '</div>' +
      '<ul class="otk-deal-facts" style="list-style:none;padding:14px 0 0;margin:14px 0 0;border-top:1px solid #edf0f5">' +
      '<li><strong>セール価格</strong><span>' + yen(p.sale) + '</span></li>' +
      (p.orig > 0 ? '<li><strong>参考価格</strong><span>' + yen(p.orig) + '</span></li>' : '') +
      (p.disc > 0 ? '<li><strong>割引率</strong><span>' + p.disc + '%OFF</span></li>' : '') +
      pointLine +
      '<li><strong>ASIN</strong><span>' + p.asin + '</span></li>' +
      '</ul></div>\n\n' +
      noteLine + '\n\n' +
      sectionTitle('セールの要点') + '\n' +
      '<p>（今回の価格条件を2文で説明。参考価格、割引率、ポイントがある場合は実質価格にも触れる）</p>\n\n' +
      sectionTitle('どんな人におすすめ？') + '\n' +
      '<p>（この商品が合いそうな人を1文で説明）</p>\n' +
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
      '<p>（価格メリットとおすすめ対象を2文で締める。断定や煽りを避ける）</p>\n\n' +
      '<p style="text-align:center;margin:26px 0">' + amazonButton(p.link) + '</p>\n' +
      '<p style="font-size:12px;color:#777;line-height:1.7">※価格・在庫・ポイント還元は記事作成時点の情報です。最新情報はAmazonの商品ページでご確認ください。この記事にはアフィリエイトリンクを含みます。</p>\n' +
      '\n【厳守ルール】HTMLのみ。h1、h2、h3、商品画像は出力しない。テンプレート外のセクションを追加しない。体験談は禁止。'
    , 2200);
  };

  var oldAutoSave = window.autoSaveArticle;
  window.autoSaveArticle = function autoSaveArticle(p, body) {
    p.postTitle = p.postTitle || titleFor(p);
    if (typeof oldAutoSave === 'function') return oldAutoSave(p, body);
  };

  var style = document.createElement('style');
  style.textContent =
    '.entry-content .otk-deal-facts li{display:flex;justify-content:space-between;gap:16px;padding:7px 0;border-bottom:1px solid #f0f2f6}.entry-content .otk-deal-facts li:last-child{border-bottom:0}.entry-content .otk-deal-facts strong{color:#39497a}.entry-content .otk-deal-facts span{text-align:right}.entry-content .otk-sale-note{border-left:4px solid #ff9900;background:#fff8ed;padding:10px 14px;border-radius:0 8px 8px 0;color:#544333;font-size:.92rem}.entry-content .otk-amazon-btn:hover{filter:brightness(1.03);transform:translateY(-1px);box-shadow:0 14px 28px rgba(255,153,0,.30)!important}.entry-content .otk-amazon-btn{transition:transform .16s ease,box-shadow .16s ease,filter .16s ease}@media(max-width:600px){.entry-content .otk-deal-facts li{display:block}.entry-content .otk-deal-facts span{display:block;text-align:left;margin-top:2px}.entry-content .otk-amazon-btn{width:100%}}';
  document.head.appendChild(style);
})();