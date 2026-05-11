/*
 * Drop-in upgrade for the Amazon affiliate article tool.
 *
 * How to use:
 * 1. Upload this file next to index.html on GitHub Pages.
 * 2. Add this line just before </body>, after the existing <script> block:
 *    <script src="./affiliate-tool-upgrade-dropin.js?v=20260511"></script>
 *
 * This file intentionally overrides a few global functions from the current tool:
 * - makeBl
 * - autoSaveArticle
 * - postToWordPress / postMtToWP / postRankToWP only when window.USE_WORKER_WP_PROXY = true
 */

(function () {
  'use strict';

  var sourcePage = '';

  window.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    sourcePage = params.get('page') || '';

    var note = params.get('note') || '';
    var noteInput = document.getElementById('qNote');
    if (note && noteInput && !noteInput.value) noteInput.value = note;

    hardenLegacyWpStorage();
    refreshUpgradeWpUi();
  });

  function hardenLegacyWpStorage() {
    if (window.USE_WORKER_WP_PROXY !== true) return;
    localStorage.removeItem('wpUrl');
    localStorage.removeItem('wpUser');
    localStorage.removeItem('wpPass');
    localStorage.removeItem('wpCatMapping');
  }

  function refreshUpgradeWpUi() {
    if (window.USE_WORKER_WP_PROXY !== true) return;

    var badge = document.getElementById('wpStatusBadge');
    var txt = document.getElementById('wpStatusTxt');
    if (badge && txt) {
      badge.style.display = 'flex';
      badge.className = 'wp-status ok';
      txt.textContent = 'Worker経由';
    }

    var wpTab = document.querySelector('#tab-wp .main .card');
    if (wpTab) {
      wpTab.innerHTML =
        '<div class="card-title">⚙️ WordPress接続設定</div>' +
        '<div class="hint-wp">WordPressの認証情報はCloudflare Workerの環境変数で管理します。このブラウザには保存しません。</div>' +
        '<div class="f"><span class="lbl">デフォルト投稿ステータス</span>' +
        '<select id="wpDefaultStatus" onchange="saveWpSettings()"><option value="draft">下書き</option><option value="publish">公開</option></select></div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<button class="btn bwp" onclick="testWpConnection()">🔌 接続テスト</button>' +
        '<button class="btn bp" onclick="fetchWpCategories()">📂 カテゴリ一覧を取得</button>' +
        '</div><div id="wpTestResult" style="margin-top:12px;font-size:12px;color:var(--mu)"></div>';
      var status = document.getElementById('wpDefaultStatus');
      if (status) status.value = localStorage.getItem('wpDefaultStatus') || 'draft';
    }
  }

  window.escapeHtml = window.escapeHtml || function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (c) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[c];
    });
  };

  function stripPromptUnsafe(value) {
    return String(value || '').replace(/[<>]/g, '').trim();
  }

  function articleTitle(p) {
    return '【' + (p.disc > 0 ? p.disc + '%OFF' : 'セール') + '】' + (p.name || 'Amazonセール対象商品');
  }

  function priceTableRows(p) {
    var rows = [
      '<tr><th>セール価格</th><td><strong>¥' + fmt(p.sale) + '</strong></td></tr>'
    ];

    if (p.orig > 0) {
      rows.push('<tr><th>参考価格</th><td><span style="text-decoration:line-through;color:#8a8a8a">¥' + fmt(p.orig) + '</span></td></tr>');
    }

    if (p.save > 0) {
      rows.push('<tr><th>お得額</th><td><strong>¥' + fmt(p.save) + 'お得</strong>' + (p.disc > 0 ? '（' + p.disc + '%OFF）' : '') + '</td></tr>');
    }

    if (p.pt > 0) {
      rows.push('<tr><th>ポイント</th><td><strong>' + fmt(p.pt) + 'pt還元</strong></td></tr>');
      rows.push('<tr><th>実質価格</th><td><strong>¥' + fmt(p.eff) + '</strong></td></tr>');
    }

    rows.push('<tr><th>ASIN</th><td>' + p.asin + '</td></tr>');
    return rows.join('');
  }

  window.makeBl = function makeBl(p) {
    var title = articleTitle(p);
    p.postTitle = title;
    p.page = sourcePage;

    var noteLine = p.note
      ? '<p class="otk-sale-note"><strong>補足:</strong> ' + stripPromptUnsafe(p.note) + '</p>'
      : '';

    return callAI(
      'WordPress用のAmazonセール速報記事をHTML形式で作成してください。Markdownは禁止。HTMLのみ出力してください。\n' +
      '\n【商品情報】\n' +
      'ASIN: ' + p.asin + '\n' +
      '商品名: ' + (p.name || '（ASINから推測）') + '\n' +
      'セール価格: ¥' + fmt(p.sale) + '\n' +
      '参考価格: ' + (p.orig ? '¥' + fmt(p.orig) : '不明') + '\n' +
      '割引: ' + (p.disc > 0 ? p.disc + '%OFF' : '不明') + '\n' +
      'お得額: ' + (p.save > 0 ? '¥' + fmt(p.save) : '不明') + '\n' +
      'ポイント: ' + (p.pt > 0 ? fmt(p.pt) + 'pt' : 'なし') + '\n' +
      '実質価格: ' + (p.eff ? '¥' + fmt(p.eff) : 'なし') + '\n' +
      '画像URL: ' + p.iUrl + '\n' +
      'アフィリエイトリンク: ' + p.link + '\n' +
      '補足: ' + (p.note || 'なし') + '\n' +
      '作成日: ' + p.date + '\n' +
      '\n【記事タイトル（変更禁止）】\n' + title + '\n' +
      '\n【記事方針】\n' +
      '・レビュー記事ではなく、セール速報記事として書く。\n' +
      '・実際に使用したような体験表現は禁止。\n' +
      '・誇大表現を避け、価格・特徴・おすすめ対象を簡潔に伝える。\n' +
      '・商品画像は本文内で1回だけ表示する。\n' +
      '・h1は出力しない。h2は「セール概要」「おすすめポイント」「購入前のチェックポイント」「まとめ」の4つだけ。\n' +
      '\n【以下のHTMLテンプレートの（）内だけを自然な文章に置き換えて出力】\n' +
      '<p class="otk-lead">（商品名・割引率・価格・おすすめ対象が1文で伝わるリード文。80〜120文字）</p>\n\n' +
      '<div class="otk-sale-card" style="border:1px solid #e6e8ef;border-radius:12px;padding:18px 18px 20px;margin:18px 0;background:#fff">' +
      '<div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">' +
      '<div style="flex:0 0 210px;max-width:100%;text-align:center"><a href="' + p.link + '" target="_blank" rel="noopener sponsored"><img src="' + p.iUrl + '" alt="' + escapeHtml(p.name || 'Amazon商品画像') + '" style="max-width:210px;width:100%;height:auto;object-fit:contain"></a></div>' +
      '<div style="flex:1;min-width:220px">' +
      '<p style="margin:0 0 8px"><span style="display:inline-block;background:#e53935;color:#fff;font-weight:700;font-size:12px;padding:3px 10px;border-radius:999px">' + (p.badge || 'SALE') + '</span></p>' +
      '<p style="margin:0 0 8px;font-size:28px;line-height:1.2;color:#e53935;font-weight:800">¥' + fmt(p.sale) + '</p>' +
      (p.orig > 0 ? '<p style="margin:0 0 10px;color:#666"><span style="text-decoration:line-through">¥' + fmt(p.orig) + '</span>' + (p.save > 0 ? ' <strong style="color:#00897b">¥' + fmt(p.save) + 'お得</strong>' : '') + '</p>' : '') +
      (p.pt > 0 ? '<p style="margin:0 0 12px;color:#00897b;font-weight:700">' + fmt(p.pt) + 'pt還元で実質¥' + fmt(p.eff) + '</p>' : '') +
      '<p style="margin:0"><a href="' + p.link + '" target="_blank" rel="noopener sponsored" style="display:inline-block;background:#ff9900;color:#fff;font-weight:700;text-decoration:none;border-radius:8px;padding:12px 22px">Amazonで価格を確認する</a></p>' +
      '</div></div></div>\n\n' +
      noteLine + '\n\n' +
      '<h2>セール概要</h2>\n' +
      '<table class="otk-price-table" style="width:100%;border-collapse:collapse;margin:12px 0 18px"><tbody>' + priceTableRows(p) + '</tbody></table>\n' +
      '<p>（このセールの要点を2文で。価格の見方、割引、ポイントがあれば実質価格にも触れる）</p>\n\n' +
      '<h2>おすすめポイント</h2>\n' +
      '<p>（商品カテゴリと用途を1文で説明）</p>\n' +
      '<ul>\n' +
      '<li><strong>（特徴1）</strong>：（カタログ情報として確認できる特徴を1文で）</li>\n' +
      '<li><strong>（特徴2）</strong>：（用途・使いどころを1文で）</li>\n' +
      '<li><strong>（特徴3）</strong>：（サイズ、機能、セット内容などを1文で）</li>\n' +
      '</ul>\n\n' +
      '<h2>購入前のチェックポイント</h2>\n' +
      '<ul>\n' +
      '<li>価格やポイント還元は変動するため、購入前にAmazonの商品ページで最新条件を確認してください。</li>\n' +
      '<li>サイズ・カラー・型番・セット内容が希望の商品と合っているか確認してください。</li>\n' +
      '<li>在庫状況や配送予定日はタイミングによって変わる場合があります。</li>\n' +
      '</ul>\n\n' +
      '<h2>まとめ</h2>\n' +
      '<p>（商品名、価格メリット、おすすめ対象を2文で締める。煽りすぎない）</p>\n\n' +
      '<p style="text-align:center;margin:22px 0"><a href="' + p.link + '" target="_blank" rel="noopener sponsored" style="display:inline-block;background:#ff9900;color:#fff;font-weight:700;text-decoration:none;border-radius:8px;padding:14px 28px">Amazonでセール価格を確認する</a></p>\n' +
      '<p style="font-size:12px;color:#777;line-height:1.7">※価格・在庫・ポイント還元は記事作成時点の情報です。最新情報はAmazonの商品ページでご確認ください。この記事にはアフィリエイトリンクを含みます。</p>\n' +
      '\n【厳守ルール】\n' +
      '・テンプレート外のセクションを追加しない\n' +
      '・HTMLのみ出力。Markdown、コードブロック、説明文は出力しない\n' +
      '・「使ってみた」「レビュー」「実感」「検証」など体験表現は禁止\n' +
      '・Amazon、メーカー、販売者の公式情報として断定できないことは断定しない'
    , 2200);
  };

  window.autoSaveArticle = function autoSaveArticle(p, body) {
    var title = p.postTitle || articleTitle(p);
    var idx = articleStock.findIndex(function (a) { return a.asin === p.asin; });
    var item = {
      id: Date.now(),
      asin: p.asin,
      name: p.name || p.asin,
      title: title,
      cat: p.cat || getSelectedCat(),
      sale: p.sale,
      orig: p.orig,
      disc: p.disc,
      pt: p.pt,
      link: p.link,
      iUrl: p.iUrl,
      body: body,
      savedAt: new Date().toLocaleDateString('ja-JP') + ' ' + new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    };
    if (idx >= 0) articleStock[idx] = item;
    else articleStock.unshift(item);
    saveArticleStock();
  };

  function readGeneratedTitle(body, fallback) {
    var text = String(body || '').replace(/<[^>]+>/g, '\n');
    var first = text.split('\n').map(function (line) {
      return line.replace(/^#+\s*/, '').trim();
    }).filter(Boolean)[0];
    return (fallback || first || 'Amazonセール速報').slice(0, 120);
  }

  function saveWpSettingsProxy() {
    var status = document.getElementById('wpDefaultStatus');
    if (status) localStorage.setItem('wpDefaultStatus', status.value);
    refreshUpgradeWpUi();
  }

  async function callWorker(action, payload) {
    var r = await fetch(WK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ action: action }, payload || {}))
    });
    var d = await r.json().catch(function () { return {}; });
    if (!r.ok || d.error) throw new Error(d.error || d.message || 'Worker APIエラー');
    return d;
  }

  function buildPostPayload(status, body, title, imageUrl, category, tags, asin) {
    return {
      status: status === 'publish' ? 'publish' : 'draft',
      asin: asin || '',
      title: title,
      content: body,
      imageUrl: imageUrl || '',
      category: category || 'セール情報',
      tags: tags || [],
      page: sourcePage || ''
    };
  }

  if (window.USE_WORKER_WP_PROXY === true) {
    window.saveWpSettings = saveWpSettingsProxy;

    window.testWpConnection = async function testWpConnection() {
      var res = document.getElementById('wpTestResult');
      if (res) res.textContent = 'Worker経由で接続テスト中...';
      try {
        var d = await callWorker('wpTest');
        if (res) {
          res.innerHTML = '<span style="color:var(--gr)">✅ 接続成功！ユーザー: ' +
            escapeHtml(d.user.name) + '（' + escapeHtml(d.user.slug) + '）</span>';
        }
        refreshUpgradeWpUi();
      } catch (e) {
        if (res) res.innerHTML = '<span style="color:var(--re)">❌ 接続失敗: ' + escapeHtml(e.message) + '</span>';
        toast('WordPress接続失敗: ' + e.message, 1);
      }
    };

    window.fetchWpCategories = async function fetchWpCategories() {
      try {
        var d = await callWorker('wpCategories');
        var card = document.getElementById('wpCatCard');
        var list = document.getElementById('wpCatList');
        if (card) card.style.display = 'block';
        if (list) {
          list.innerHTML = (d.categories || []).map(function (c) {
            return '<div><strong style="color:var(--am)">ID: ' + c.id + '</strong> → ' +
              escapeHtml(c.name) + ' (slug: ' + escapeHtml(c.slug) + ')</div>';
          }).join('');
        }
        toast('カテゴリを取得しました！');
      } catch (e) {
        toast('取得失敗: ' + e.message, 1);
      }
    };

    window.postToWordPress = async function postToWordPress(status) {
      var body = document.getElementById('blOut').textContent;
      if (!body) return toast('先に記事を生成してください', 1);
      if (!cur) return toast('商品情報がありません', 1);

      var btn = status === 'publish' ? document.getElementById('wpPublishBtn') : document.getElementById('wpPostBtn');
      var oldLabel = btn ? btn.innerHTML : '';
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="sp"></span>' + (status === 'publish' ? '公開中...' : '保存中...');
      }

      try {
        var tags = (document.getElementById('qTags').value || '').split(',').map(function (t) { return t.trim(); }).filter(Boolean);
        var fallbackTitle = cur.postTitle || articleTitle(cur);
        var d = await callWorker('wpPost', buildPostPayload(
          status,
          body,
          readGeneratedTitle(body, fallbackTitle),
          cur.iUrl,
          cur.cat || 'セール情報',
          tags,
          cur.asin
        ));

        toast(d.duplicate ? '既に同じASINの記事があります。編集画面を開きます。' : '✅ WordPressに' + (status === 'publish' ? '公開' : '下書き保存') + 'しました！');
        if (d.editLink) window.open(d.editLink, '_blank', 'noopener');
        else if (d.link) window.open(d.link, '_blank', 'noopener');
      } catch (e) {
        toast('投稿失敗: ' + e.message, 1);
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = oldLabel || (status === 'publish' ? '🚀 WordPressに公開' : '📝 WordPressに下書き保存');
        }
      }
    };

    window.postMtToWP = async function postMtToWP(status) {
      var body = document.getElementById('mtOut').textContent;
      if (!body) return toast('先に生成してください', 1);
      try {
        var d = await callWorker('wpPost', buildPostPayload(status, body, readGeneratedTitle(body, 'Amazonお得まとめ'), '', 'セール情報', ['Amazon', 'セール'], ''));
        toast('✅ WordPressに' + (status === 'publish' ? '公開' : '下書き保存') + 'しました！');
        if (d.editLink) window.open(d.editLink, '_blank', 'noopener');
      } catch (e) {
        toast('投稿失敗: ' + e.message, 1);
      }
    };

    window.postRankToWP = async function postRankToWP(status) {
      var body = document.getElementById('rankOut').textContent;
      if (!body) return toast('先に生成してください', 1);
      try {
        var first = rankItems[0] || {};
        var title = readGeneratedTitle(body, document.getElementById('rankTitle').value || 'Amazonランキング記事');
        var d = await callWorker('wpPost', buildPostPayload(status, body, title, first.iUrl || '', 'セール情報', ['Amazon', 'ランキング'], ''));
        toast('✅ WordPressに' + (status === 'publish' ? '公開' : '下書き保存') + 'しました！');
        if (d.editLink) window.open(d.editLink, '_blank', 'noopener');
      } catch (e) {
        toast('投稿失敗: ' + e.message, 1);
      }
    };
  }
})();
