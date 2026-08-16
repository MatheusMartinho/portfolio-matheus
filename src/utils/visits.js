/**
 * Contador de visitas do portfólio.
 * Vive num schema isolado (`portfolio`) do Supabase; a tabela não é exposta,
 * todo acesso passa por duas funções RPC públicas. A chave abaixo é publishable
 * (feita para rodar no navegador), só executa essas duas funções.
 */
const SUPABASE_URL = 'https://bykbcrhrxubcnmyrjmvh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_76LikfQzLpZQBnJIHU4UXw_DHnFWLQE';

const HEADERS = {
  'Content-Type': 'application/json',
  apikey: SUPABASE_KEY,
};

const TRACKED_KEY = 'pv-tracked-paths';
const VISITOR_KEY = 'pv-visitor-n';

/* registra a visita (uma vez por rota por sessão) e guarda o nº do visitante */
export const trackVisit = pathname => {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') {
    return;
  }
  const path = pathname || window.location.pathname || '/';

  try {
    const tracked = JSON.parse(window.sessionStorage.getItem(TRACKED_KEY) || '[]');
    if (tracked.includes(path)) {
      return;
    }
    tracked.push(path);
    window.sessionStorage.setItem(TRACKED_KEY, JSON.stringify(tracked));
  } catch (e) {
    /* sem storage, registra mesmo assim */
  }

  fetch(`${SUPABASE_URL}/rest/v1/rpc/portfolio_track_visit`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ p_path: path }),
  })
    .then(res => (res.ok ? res.json() : null))
    .then(total => {
      if (typeof total === 'number') {
        try {
          if (!window.sessionStorage.getItem(VISITOR_KEY)) {
            window.sessionStorage.setItem(VISITOR_KEY, String(total));
          }
        } catch (e) {
          /* sem storage, sem número persistido */
        }
      }
    })
    .catch(() => {
      /* offline: a visita fica sem registro, o site segue normal */
    });
};

/* o número que este visitante tirou na "senha" desta sessão */
export const getVisitorNumber = () => {
  try {
    const n = window.sessionStorage.getItem(VISITOR_KEY);
    return n ? parseInt(n, 10) : null;
  } catch (e) {
    return null;
  }
};

/* agregados públicos para a página /stats */
export const fetchVisitStats = () =>
  fetch(`${SUPABASE_URL}/rest/v1/rpc/portfolio_stats`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({}),
  }).then(res => (res.ok ? res.json() : null));
