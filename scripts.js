document.addEventListener('DOMContentLoaded', () => {
  const sections = ['live2d', 'arte', '3d'];
  const TWEET_SCRIPT_ID = 'twitter-wjs';
  const TABLE_COLS = 3;
  const TOGGLE_OPEN = '▾';
  const TOGGLE_CLOSED = '▸';
  const ANIMATION_DURATION_MS = 300;

  function createIframe(src) {
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.loading = 'lazy';
    iframe.width = '560';
    iframe.height = '315';
    return iframe;
  }

  function renderEntryToTable(entry, addCell) {
    if (!entry) return;
    const trimmed = entry.trim();

    if (trimmed.startsWith('<iframe')) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = trimmed;
      addCell(wrapper);
      return;
    }

    try {
      if (trimmed.includes('youtube.com/watch')) {
        const url = new URL(trimmed);
        const id = url.searchParams.get('v');
        if (id) { addCell(createIframe('https://www.youtube.com/embed/' + id)); return; }
      } else if (trimmed.includes('youtu.be/')) {
        const id = trimmed.split('youtu.be/')[1].split(/[?#]/)[0];
        addCell(createIframe('https://www.youtube.com/embed/' + id)); return;
      }
    } catch (e) { /* ignore */ }

    const tweetRegex = /https?:\/\/(?:www\.|mobile\.)?(?:twitter|x)\.com\/(?:#!\/)?[^\/]+\/status(?:es)?\/(\d+)(?:\S*)/i;
    const m = trimmed.match(tweetRegex);
    if (m) {
      const tweetUrl = trimmed.split('?')[0];
      const block = document.createElement('blockquote');
      block.className = 'twitter-tweet';
      block.setAttribute('data-media-max-width', '560');
      const a = document.createElement('a');
      a.href = tweetUrl;
      a.textContent = tweetUrl;
      block.appendChild(a);
      addCell(block);

      if (window.twttr && window.twttr.widgets && typeof window.twttr.widgets.load === 'function') {
        try { window.twttr.widgets.load(); } catch (_) { /* ignore */ }
      } else if (!document.getElementById(TWEET_SCRIPT_ID)) {
        const s = document.createElement('script');
        s.id = TWEET_SCRIPT_ID;
        s.src = 'https://platform.twitter.com/widgets.js';
        s.async = true;
        document.body.appendChild(s);
      }
      return;
    }

    if (trimmed.startsWith('http')) {
      addCell(createIframe(trimmed));
      return;
    }

    const p = document.createElement('p');
    p.textContent = trimmed;
    addCell(p);
  }

  // Animated toggle helper: uses maxHeight for smooth slide
  function toggleSubpanel(subpanel, toggleButton) {
    const isOpen = subpanel.getAttribute('data-open') === 'true';
    if (isOpen) {
      // Collapse
      const curHeight = subpanel.scrollHeight;
      subpanel.style.maxHeight = curHeight + 'px';
      subpanel.offsetHeight; // force reflow
      subpanel.style.transition = `max-height ${ANIMATION_DURATION_MS}ms ease`;
      subpanel.style.maxHeight = '0px';
      subpanel.setAttribute('data-open', 'false');
      toggleButton.textContent = TOGGLE_CLOSED;
      toggleButton.setAttribute('aria-expanded', 'false');
    } else {
      // Expand
      subpanel.style.transition = `max-height ${ANIMATION_DURATION_MS}ms ease`;
      subpanel.style.maxHeight = subpanel.scrollHeight + 'px';
      subpanel.setAttribute('data-open', 'true');
      toggleButton.textContent = TOGGLE_OPEN;
      toggleButton.setAttribute('aria-expanded', 'true');

      const onEnd = () => {
        if (subpanel.getAttribute('data-open') === 'true') {
          subpanel.style.maxHeight = 'none';
        }
        subpanel.removeEventListener('transitionend', onEnd);
      };
      subpanel.addEventListener('transitionend', onEnd);
    }
  }

  fetch('videos.json').then(r => {
    if (!r.ok) throw new Error('videos.json not found');
    return r.json();
  }).then(data => {
    sections.forEach(sec => {
      const article = document.querySelector(`#${sec}.section-block`);
      if (!article) return;
      const subsections = article.querySelector('.subsections');
      subsections.innerHTML = '';

      const groups = data[sec] || {};
      Object.keys(groups).forEach(groupName => {
        const groupWrap = document.createElement('div');
        groupWrap.className = 'subsection';

        // Create subpanel that will be animated; initial collapsed state
        const subpanel = document.createElement('div');
        subpanel.className = 'subpanel';
        subpanel.style.maxHeight = '0px';
        subpanel.style.overflow = 'hidden';
        subpanel.setAttribute('data-open', 'false');

        const group = document.createElement('div');
        group.className = 'group';

        // Header: toggle caret + visible title; make whole header clickable & keyboard accessible
        const header = document.createElement('div');
        header.className = 'group-header';
        header.setAttribute('role', 'button');
        header.setAttribute('tabindex', '0');
        header.setAttribute('aria-controls', `${sec}-${groupName}-panel`);
        header.setAttribute('aria-expanded', 'false');

        const toggle = document.createElement('button');
        toggle.className = 'toggle sub-toggle';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', `Expand or collapse ${groupName}`);
        toggle.textContent = TOGGLE_CLOSED;

        const title = document.createElement('h3');
        title.className = 'group-title';
        title.textContent = groupName;

        header.appendChild(toggle);
        header.appendChild(title);
        group.appendChild(header);

        // Items list
        const items = groups[groupName] || {};
        const ul = document.createElement('ul');
        ul.className = 'items';

        Object.keys(items).forEach(itemName => {
          const li = document.createElement('li');
          li.className = 'item';
          const row = document.createElement('div');
          row.className = 'item-row';

          const strong = document.createElement('strong');
          strong.className = 'item-title';
          strong.textContent = itemName;
          row.appendChild(strong);
          li.appendChild(row);

          const table = document.createElement('table');
          table.className = 'videos-table';
          let currentRow = null;
          function addCell(contentEl) {
            if (!currentRow || currentRow.children.length >= TABLE_COLS) {
              currentRow = document.createElement('tr');
              table.appendChild(currentRow);
            }
            const td = document.createElement('td');
            td.className = 'video-cell';
            const wrap = document.createElement('div');
            wrap.className = 'video-wrap';
            wrap.appendChild(contentEl);
            td.appendChild(wrap);
            currentRow.appendChild(td);
          }

          const arr = items[itemName] || [];
          arr.forEach(entry => renderEntryToTable(entry, addCell));

          if (currentRow && currentRow.children.length > 0 && currentRow.children.length < TABLE_COLS) {
            const missing = TABLE_COLS - currentRow.children.length;
            for (let i = 0; i < missing; i++) {
              const emptyTd = document.createElement('td');
              emptyTd.className = 'video-cell empty';
              currentRow.appendChild(emptyTd);
            }
          }

          li.appendChild(table);
          ul.appendChild(li);
        });

        group.appendChild(ul);
        subpanel.appendChild(group);
        subpanel.id = `${sec}-${groupName}-panel`;
        groupWrap.appendChild(header);    // header before subpanel in DOM for logical order
        groupWrap.appendChild(subpanel); // append subpanel after header
        subsections.appendChild(groupWrap);

        // Click on the caret button toggles
        toggle.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleSubpanel(subpanel, toggle);
          const expanded = toggle.getAttribute('aria-expanded') === 'true';
          header.setAttribute('aria-expanded', String(expanded));
        });

        // Click anywhere on header toggles
        header.addEventListener('click', () => {
          toggleSubpanel(subpanel, toggle);
          header.setAttribute('aria-expanded', String(subpanel.getAttribute('data-open') === 'true'));
        });

        // Make header keyboard accessible: Enter or Space toggles
        header.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            header.click();
          }
        });
      });
    });

    // After insertion, ask Twitter widgets to parse blockquotes (if available)
    if (window.twttr && window.twttr.widgets && typeof window.twttr.widgets.load === 'function') {
      try { window.twttr.widgets.load(); } catch (_) { /* ignore */ }
    }
  }).catch(err => {
    console.warn('No se pudo cargar videos.json:', err);
  });

  // Index nav behaviour (scroll)
  document.querySelectorAll('.main-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      const panel = document.getElementById(target);
      if (!panel) return;
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
});
