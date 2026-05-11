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
