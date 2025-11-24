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

      const toggle = document.createElement('button');
      toggle.className = 'toggle sub-toggle';
      toggle.textContent = groupName + ' ▸';
      groupWrap.appendChild(toggle);

      const subpanel = document.createElement('div');
      subpanel.className = 'subpanel';
      subpanel.style.display = 'none';

      const group = document.createElement('div');
      group.className = 'group';
      const title = document.createElement('h3');
      title.className = 'group-title';
      title.textContent = groupName;
      group.appendChild(title);

      const ul = document.createElement('ul');
      ul.className = 'items';

      structure[groupName].forEach(itemName=>{
        const li = document.createElement('li');
        li.className = 'item';
        const row = document.createElement('div'); row.className='item-row';
        const strong = document.createElement('strong'); strong.className='item-title'; strong.textContent = itemName;
        const actions = document.createElement('div'); actions.className='item-actions';
        const btn = document.createElement('button'); btn.className='add-video'; btn.textContent = 'Agregar video';
        actions.appendChild(btn);
        row.appendChild(strong); row.appendChild(actions);
        li.appendChild(row);
        const videos = document.createElement('div'); videos.className='videos';
        li.appendChild(videos);

        // Add video handler
        btn.addEventListener('click',()=>{
          const input = prompt('Pega la URL de video (YouTube) o el código iframe:');
          if(!input) return;
          // If contains iframe tag, insert directly
          if(input.trim().startsWith('<iframe')){
            const wrapper = document.createElement('div');
            wrapper.innerHTML = input;
            videos.appendChild(wrapper);
            return;
          }
          let src = '';
          // youtube watch -> embed
          try{
            if(input.includes('youtube.com/watch')){
              const url = new URL(input);
              const id = url.searchParams.get('v');
              if(id) src = 'https://www.youtube.com/embed/' + id;
            } else if(input.includes('youtu.be/')){
              const id = input.split('youtu.be/')[1].split(/[?#]/)[0];
              src = 'https://www.youtube.com/embed/' + id;
            } else if(input.startsWith('http')){
              src = input;
            }
          }catch(e){src=''}
          if(!src){
            alert('No se ha podido reconocer la URL. Intenta pegar un iframe o una URL completa.');
            return;
          }
          const iframe = document.createElement('iframe');
          iframe.src = src;
          iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
          iframe.loading = 'lazy';
          videos.appendChild(iframe);
        });

        ul.appendChild(li);
      });

      group.appendChild(ul);
      subpanel.appendChild(group);
      groupWrap.appendChild(subpanel);
      subsections.appendChild(groupWrap);

      // Toggle handler
      toggle.addEventListener('click',()=>{
        const visible = subpanel.style.display !== 'none';
        subpanel.style.display = visible ? 'none' : 'block';
        toggle.textContent = groupName + (visible ? ' ▸' : ' ▾');
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
