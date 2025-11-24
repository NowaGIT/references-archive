document.addEventListener('DOMContentLoaded',()=>{
  const structure = {
    "Head":["Eyes","Mouth","Expression","Hair","Other"],
    "Body":["Angles","Arms","Chest","Legs","Other"],
    "Clothing":["Skirt/Dress","Other"],
    "Animal":["Ears","Tail","Muzzle","Pets"]
  };

  const sections = ['live2d','arte','3d'];

  // Populate each main section with subsections & items
  sections.forEach(s=>{
    const article = document.querySelector(`#${s}.section-block`);
    const subsections = article.querySelector('.subsections');
    Object.keys(structure).forEach(groupName=>{
      const groupWrap = document.createElement('div');
      groupWrap.className = 'subsection';

      document.addEventListener('DOMContentLoaded',()=>{
        const sections = ['live2d','arte','3d'];

        // Helper: create an iframe element for a URL
        function createIframe(src){
          const iframe = document.createElement('iframe');
          iframe.src = src;
          iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
          iframe.loading = 'lazy';
          return iframe;
        }

        // Render a single video entry (url or iframe html or tweet url)
        function renderVideoEntry(videosContainer, entry){
          if(!entry) return;
          const trimmed = entry.trim();

          // Raw iframe HTML
          if(trimmed.startsWith('<iframe')){
            const wrapper = document.createElement('div');
            wrapper.innerHTML = trimmed;
            videosContainer.appendChild(wrapper);
            return;
          }

          // YouTube detection
          try{
            if(trimmed.includes('youtube.com/watch')){
              const url = new URL(trimmed);
              const id = url.searchParams.get('v');
              if(id){ videosContainer.appendChild(createIframe('https://www.youtube.com/embed/' + id)); return; }
            } else if(trimmed.includes('youtu.be/')){
              const id = trimmed.split('youtu.be/')[1].split(/[?#]/)[0];
              videosContainer.appendChild(createIframe('https://www.youtube.com/embed/' + id)); return;
            }
          }catch(e){}

          // Twitter / X tweet URL detection
          const tweetRegex = /https?:\/\/(?:www\.|mobile\.)?(?:twitter|x)\.com\/(?:#!\/)?[^\/]+\/status(?:es)?\/(\d+)(?:\S*)/i;
          const m = trimmed.match(tweetRegex);
          if(m){
            const tweetUrl = trimmed.split('?')[0];
            const block = document.createElement('blockquote');
            block.className = 'twitter-video';
            const a = document.createElement('a'); a.href = tweetUrl; a.textContent = tweetUrl;
            block.appendChild(a);
            videosContainer.appendChild(block);

            if(window.twttr && window.twttr.widgets && typeof window.twttr.widgets.load === 'function'){
              try{ window.twttr.widgets.load(videosContainer); }catch(e){}
            } else if(!document.getElementById('twitter-wjs')){
              const s = document.createElement('script'); s.id = 'twitter-wjs'; s.src = 'https://platform.twitter.com/widgets.js'; s.async = true; document.body.appendChild(s);
            }
            return;
          }

          // Fallback: if it starts with http, embed as iframe
          if(trimmed.startsWith('http')){
            videosContainer.appendChild(createIframe(trimmed));
            return;
          }

          // Unknown format - add as plain text
          const p = document.createElement('p'); p.textContent = trimmed; videosContainer.appendChild(p);
        }

        // Load videos.json and render
        fetch('videos.json').then(r=>{
          if(!r.ok) throw new Error('videos.json not found');
          return r.json();
        }).then(data=>{
          sections.forEach(sec=>{
            const article = document.querySelector(`#${sec}.section-block`);
            const subsections = article.querySelector('.subsections');
            // Clear any existing
            subsections.innerHTML = '';

            const groups = data[sec] || {};
            Object.keys(groups).forEach(groupName=>{
              const groupWrap = document.createElement('div'); groupWrap.className = 'subsection';
              const toggle = document.createElement('button'); toggle.className = 'toggle sub-toggle'; toggle.textContent = groupName + ' ▸';
              groupWrap.appendChild(toggle);

              const subpanel = document.createElement('div'); subpanel.className = 'subpanel'; subpanel.style.display = 'none';
              const group = document.createElement('div'); group.className = 'group';
              const title = document.createElement('h3'); title.className = 'group-title'; title.textContent = groupName; group.appendChild(title);

              const items = groups[groupName] || {};
              const ul = document.createElement('ul'); ul.className = 'items';

              Object.keys(items).forEach(itemName=>{
                const li = document.createElement('li'); li.className = 'item';
                const row = document.createElement('div'); row.className = 'item-row';
                const strong = document.createElement('strong'); strong.className = 'item-title'; strong.textContent = itemName;
                row.appendChild(strong);
                li.appendChild(row);
                const videos = document.createElement('div'); videos.className = 'videos';

                const arr = items[itemName] || [];
                arr.forEach(entry => renderVideoEntry(videos, entry));

                li.appendChild(videos);
                ul.appendChild(li);
              });

              group.appendChild(ul);
              subpanel.appendChild(group);
              groupWrap.appendChild(subpanel);
              subsections.appendChild(groupWrap);

              toggle.addEventListener('click',()=>{
                const visible = subpanel.style.display !== 'none';
                subpanel.style.display = visible ? 'none' : 'block';
                toggle.textContent = groupName + (visible ? ' ▸' : ' ▾');
              });
            });
          });
        }).catch(err=>{
          console.warn('No se pudo cargar videos.json:', err);
        });

        // Index nav behaviour (scroll)
        document.querySelectorAll('.main-toggle').forEach(btn=>{
          btn.addEventListener('click',()=>{
            const target = btn.dataset.target; const panel = document.getElementById(target); if(!panel) return; panel.scrollIntoView({behavior:'smooth',block:'start'});
          });
        });
      });

  // Index toggles (left nav) to expand/collapse and scroll to section
  document.querySelectorAll('.main-toggle').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const target = btn.dataset.target;
      const panel = document.getElementById(target);
      if(!panel) return;
      // scroll into view
      panel.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });
});
