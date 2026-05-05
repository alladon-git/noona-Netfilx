const API_KEY = 'c8ab369285b62e81cc9da71d1728d6cb';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

// ── 네비게이션: 스크롤 시 배경 전환 ──
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
});

// ── 유틸 함수 ──
function formatDate(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-');
  return `${y}년 ${m}월 ${d}일`;
}

function ratingColor(score) {
  if (score >= 7) return 'green';
  if (score >= 5) return '';
  return 'red';
}

// ── 히어로 배너 렌더링 ──
function renderHero(movie) {
  const backdropUrl = movie.backdrop_path
    ? `${IMG_BASE}/original${movie.backdrop_path}`
    : movie.poster_path
      ? `${IMG_BASE}/w780${movie.poster_path}`
      : '';

  if (backdropUrl) {
    document.getElementById('hero-backdrop').style.backgroundImage = `url('${backdropUrl}')`;
  }

  document.getElementById('hero-title').textContent = movie.title || movie.original_title;
  document.getElementById('hero-overview').textContent = movie.overview || '줄거리 정보가 없습니다.';
  document.getElementById('hero-meta').innerHTML = `
    <span class="hero-rating">★ ${movie.vote_average.toFixed(1)}</span>
    <span style="color:#aaa">${formatDate(movie.release_date)}</span>
    <span style="color:#aaa">인기도 ${Math.round(movie.popularity)}</span>
  `;

  document.getElementById('hero-btn').onclick = () => openModal(movie);
}

// ── 영화 카드 생성 ──
function createCard(movie) {
  const card = document.createElement('div');
  card.className = 'movie-card';

  const posterUrl = movie.poster_path ? `${IMG_BASE}/w342${movie.poster_path}` : null;

  if (posterUrl) {
    const img = document.createElement('img');
    img.src = posterUrl;
    img.alt = movie.title;
    img.loading = 'lazy';
    card.appendChild(img);
  } else {
    card.innerHTML = `
      <div class="no-poster">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-1.1 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
        </svg>
        <span>포스터 없음</span>
      </div>
    `;
  }

  const overlay = document.createElement('div');
  overlay.className = 'movie-card-overlay';
  overlay.innerHTML = `
    <div class="movie-card-title">${movie.title || movie.original_title}</div>
    <div class="movie-card-rating">
      ★ ${movie.vote_average.toFixed(1)}
      <span>· ${movie.vote_count.toLocaleString()}명</span>
    </div>
  `;
  card.appendChild(overlay);

  card.addEventListener('click', () => openModal(movie));
  return card;
}

// ── 모달 열기 ──
function openModal(movie) {
  const backdropUrl = movie.backdrop_path
    ? `${IMG_BASE}/w780${movie.backdrop_path}`
    : movie.poster_path
      ? `${IMG_BASE}/w780${movie.poster_path}`
      : '';

  const backdropImg = document.getElementById('modal-backdrop-img');
  backdropImg.src = backdropUrl;
  backdropImg.style.display = backdropUrl ? 'block' : 'none';

  document.getElementById('modal-title').textContent = movie.title || movie.original_title;
  document.getElementById('modal-overview').textContent = movie.overview || '줄거리 정보가 없습니다.';

  const color = ratingColor(movie.vote_average);
  const originalTitle = movie.original_title !== movie.title
    ? `<span style="color:#888">원제: ${movie.original_title}</span>`
    : '';

  document.getElementById('modal-meta').innerHTML = `
    <span class="badge ${color}">★ ${movie.vote_average.toFixed(1)}</span>
    <span class="badge">${formatDate(movie.release_date)}</span>
    <span class="badge">👥 ${movie.vote_count.toLocaleString()}명 평가</span>
    <span class="badge">🔥 인기도 ${Math.round(movie.popularity)}</span>
    ${originalTitle}
  `;

  document.getElementById('modal-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

// ── 모달 닫기 ──
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ── 영화 데이터 fetch ──
async function fetchMovies() {
  const grid = document.getElementById('movie-grid');

  try {
    const res = await fetch(
      `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=ko-KR&page=1`
    );

    if (!res.ok) throw new Error(`API 오류: ${res.status} ${res.statusText}`);

    const data = await res.json();
    const movies = data.results || [];

    if (movies.length === 0) {
      grid.innerHTML = '<div class="error-box">현재 상영 중인 영화 정보가 없습니다.</div>';
      return;
    }

    // 히어로: 인기도 1위 영화
    const featured = [...movies].sort((a, b) => b.popularity - a.popularity)[0];
    renderHero(featured);

    // 영화 개수
    document.getElementById('movie-count').textContent = `영화 ${movies.length}편`;

    // 카드 렌더링
    grid.innerHTML = '';
    movies.forEach((movie) => grid.appendChild(createCard(movie)));

  } catch (err) {
    grid.innerHTML = `
      <div class="error-box">
        ⚠️ 영화 데이터를 불러오지 못했습니다.<br/>
        <small style="color:#999; margin-top:6px; display:block">${err.message}</small>
      </div>
    `;
    console.error(err);
  }
}

fetchMovies();
