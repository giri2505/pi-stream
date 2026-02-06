fetch('/api/videos', {
  headers: { Authorization: localStorage.token }
})
.then(r => r.json())
.then(videos => {
  const byCat = {};
  videos.forEach(v => {
    byCat[v.category] = byCat[v.category] || [];
    byCat[v.category].push(v);
  });

  const root = document.getElementById('content');
  Object.keys(byCat).forEach(cat => {
    root.innerHTML += `<h2>${cat}</h2><div class="grid" id="${cat}"></div>`;
    byCat[cat].forEach(v => {
      document.getElementById(cat).innerHTML += `
        <div class="card" onclick="play('${v.file}')">
          <img src="/posters/${v.title}.jpg" />
        </div>`;
    });
  });
});

function play(file) {
  location.href = `player.html?file=${encodeURIComponent(file)}`;
}
