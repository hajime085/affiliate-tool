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
