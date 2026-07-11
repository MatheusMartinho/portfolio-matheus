import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';

const ResumePage = () => {
    useEffect(() => {
        // Language toggle function
        window.toggleLanguage = function () {
            const currentLang = document.body.getAttribute('data-lang') || 'pt';
            const newLang = currentLang === 'pt' ? 'en' : 'pt';

            document.body.setAttribute('data-lang', newLang);

            const elements = document.querySelectorAll('[data-en]');
            elements.forEach(el => {
                if (newLang === 'en') {
                    if (!el.getAttribute('data-pt')) {
                        el.setAttribute('data-pt', el.innerHTML);
                    }
                    el.innerHTML = el.getAttribute('data-en');
                } else {
                    el.innerHTML = el.getAttribute('data-pt');
                }
            });

            const btn = document.querySelector('.lang-switch');
            if (btn) btn.textContent = newLang === 'en' ? 'PT' : 'EN';
        };
    }, []);

    return (
        <>
            <Helmet>
                <title>Resume - Matheus M. Martinho</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
                <style>{`
          :root {
            --bg-color: #ffffff;
            --text-primary: #141414;
            --text-secondary: #5c5c5c;
            --accent: #b7e62e;
            --border-color: #e8e8e8;
            --mono-font: 'JetBrains Mono', monospace;
            --sans-font: 'Inter', sans-serif;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background-color: #f2f2f0 !important;
            font-family: var(--sans-font);
            color: var(--text-primary);
            line-height: 1.55;
            -webkit-font-smoothing: antialiased;
          }
          .resume-container {
            background-color: var(--bg-color);
            width: 210mm;
            min-height: 297mm;
            margin: 40px auto;
            padding: 46px 54px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          }
          @media print {
            body { background-color: #fff !important; }
            .resume-container { width: 100%; margin: 0; padding: 30px 40px !important; box-shadow: none; }
            @page { margin: 0; }
            .lang-switch { display: none !important; }
          }
          @media (max-width: 768px) {
            .resume-container { width: 100%; margin: 0; padding: 24px 20px; box-shadow: none; }
            .header { flex-direction: column; gap: 16px; }
            .contact-info { text-align: left !important; }
            .skills-grid { grid-template-columns: 1fr !important; }
            .bottom-grid { flex-direction: column; gap: 0; }
          }
          h1 {
            font-family: var(--mono-font);
            font-size: 1.9rem;
            font-weight: 700;
            letter-spacing: -0.5px;
            line-height: 1.15;
            text-transform: uppercase;
          }
          .role-line {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 8px;
            font-size: 1rem;
            font-weight: 500;
            color: var(--text-secondary);
          }
          .role-line:before {
            content: '';
            width: 10px;
            height: 10px;
            background: var(--accent);
            flex-shrink: 0;
          }
          h2 {
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: var(--mono-font);
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.22em;
            color: var(--text-primary);
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 9px;
            margin: 28px 0 16px 0;
          }
          h2:before {
            content: '';
            width: 8px;
            height: 8px;
            background: var(--accent);
            flex-shrink: 0;
          }
          h3 { font-size: 1.02rem; font-weight: 700; margin-bottom: 2px; }
          p, li { font-size: 0.92rem; color: var(--text-primary); }
          .small-text { font-family: var(--mono-font); font-size: 0.78rem; color: var(--text-secondary); }
          a { color: var(--text-primary); text-decoration: none; border-bottom: 1px solid var(--border-color); }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
          .contact-info { text-align: right; font-family: var(--mono-font); }
          .contact-info div { margin-bottom: 4px; }
          .summary { font-size: 0.98rem; color: #333; margin-bottom: 6px; max-width: 94%; }
          .skills-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 6px; }
          .skill-category strong { display: block; font-family: var(--mono-font); font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 7px; }
          .skill-category { font-size: 0.9rem; color: #333; }
          .job-entry, .project-entry { margin-bottom: 18px; }
          .job-header, .project-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; flex-wrap: wrap; gap: 10px; }
          .job-role { font-weight: 500; color: var(--text-secondary); }
          .store-tag {
            display: inline-block;
            font-family: var(--mono-font);
            font-size: 0.66rem;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            background: var(--accent);
            color: #141414;
            padding: 3px 8px;
            margin-left: 6px;
            vertical-align: 2px;
          }
          ul { list-style-type: none; padding-left: 0; }
          ul li { margin-bottom: 6px; padding-left: 18px; position: relative; }
          ul li::before { content: ''; position: absolute; left: 0; top: 0.5em; width: 7px; height: 7px; background: var(--accent); }
          .lang-switch {
            position: fixed; top: 40px; right: 40px; cursor: pointer;
            font-family: var(--mono-font); font-size: 0.8rem; font-weight: 700; letter-spacing: 0.1em;
            border: none; padding: 10px 16px; transition: all 0.2s;
            background: #141414; color: var(--accent); z-index: 1000;
          }
          .lang-switch:hover { background: #333; }
          .bottom-grid { display: flex; gap: 40px; }
          .bottom-grid section { flex: 1; }
        `}</style>
            </Helmet>

            <div data-lang="pt">
                <button className="lang-switch" onClick={() => window.toggleLanguage && window.toggleLanguage()}>EN</button>

                <div className="resume-container">
                    <header className="header">
                        <div>
                            <h1>Matheus M.<br />Martinho</h1>
                            <div className="role-line" data-en="Full-Stack Developer | Mobile & Web">
                                Desenvolvedor Full-Stack | Mobile & Web
                            </div>
                        </div>
                        <div className="contact-info small-text">
                            <div data-en="São Paulo, Brazil (Remote Available)">São Paulo, SP (Remoto)</div>
                            <div>+55 (11) 98705-5693</div>
                            <div><a href="https://matheusmartinho.dev">matheusmartinho.dev</a></div>
                            <div><a href="mailto:matmouramartinho@gmail.com">matmouramartinho@gmail.com</a></div>
                        </div>
                    </header>

                    <section className="summary">
                        <p data-en="Full-stack developer from São Paulo. I own the whole product: architecture, code, infra and UX, from first commit to launch. Creator of <strong>The Pitch</strong>, a social stadium check-in app live on the App Store and Google Play, and <strong>CINELOG</strong>, a social network for film lovers. Core stack: <strong>React, Next.js, TypeScript and React Native</strong>, with AI (Claude, Cursor) as a development copilot.">
                            Desenvolvedor full-stack de São Paulo. Cuido do produto inteiro: arquitetura, código, infra e UX, do primeiro commit ao lançamento. Criador do <strong>The Pitch</strong>, app de check-in social em estádios no ar na App Store e no Google Play, e do <strong>CINELOG</strong>, rede social para cinéfilos. Stack principal: <strong>React, Next.js, TypeScript e React Native</strong>, com IA (Claude, Cursor) como copiloto de desenvolvimento.
                        </p>
                    </section>

                    <section>
                        <h2 data-en="Technical Skills">Competências Técnicas</h2>
                        <div className="skills-grid">
                            <div className="skill-category">
                                <strong>Frontend & Mobile</strong>
                                React, React Native, Next.js, TypeScript, Expo, Tailwind CSS
                            </div>
                            <div className="skill-category">
                                <strong data-en="Backend & Data">Backend & Dados</strong>
                                <span data-en="Node.js, Supabase, PostgreSQL, REST APIs, Stripe">Node.js, Supabase, PostgreSQL, APIs REST, Stripe</span>
                            </div>
                            <div className="skill-category">
                                <strong>Workflow & Tools</strong>
                                Git/GitHub, EAS, Vercel, Figma, Claude, Cursor
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 data-en="Featured Projects">Projetos em Destaque</h2>
                        <div className="project-entry">
                            <div className="project-header">
                                <h3 data-en="The Pitch | Social Check-in App for Stadiums <span class='store-tag'>Live on the stores</span>">The Pitch | Check-in Social em Estádios <span className="store-tag">Nas lojas</span></h3>
                            </div>
                            <ul>
                                <li data-en="Social check-in app with <strong>GPS verification</strong> for football fans, built in <strong>React Native + Expo SDK 55</strong>. Published on the <strong>App Store and Google Play</strong>.">App de check-in social com <strong>verificação por GPS</strong> para torcedor de futebol, em <strong>React Native + Expo SDK 55</strong>. Publicado na <strong>App Store e no Google Play</strong>.</li>
                                <li data-en="Real-time social feed with predictions, polls and group chat powered by <strong>Supabase Realtime</strong>.">Feed social em tempo real com palpites, enquetes e grupos com chat via <strong>Supabase Realtime</strong>.</li>
                                <li data-en="Gamification with <strong>XP</strong>, levels and badges to reward in-person attendance.">Gamificação com <strong>XP</strong>, níveis e badges para recompensar presença no estádio.</li>
                                <li data-en="Production deploys via <strong>EAS</strong> with OTA updates, push notifications and an offline-first architecture for weak stadium signal.">Deploy em produção via <strong>EAS</strong> com OTA updates, push notifications e arquitetura offline-first para sinal fraco no estádio.</li>
                            </ul>
                        </div>
                        <div className="project-entry">
                            <div className="project-header">
                                <h3 data-en="CINELOG | Social Network for Film Lovers">CINELOG | Rede Social para Cinéfilos</h3>
                            </div>
                            <ul>
                                <li data-en="Mobile-first social platform in <strong>React Native</strong>, with a full movie catalog via the <strong>TMDB API</strong>.">Plataforma social <em>mobile-first</em> em <strong>React Native</strong>, com catálogo completo de filmes via <strong>API do TMDB</strong>.</li>
                                <li data-en="<strong>Supabase/PostgreSQL</strong> database and unit tests with <strong>Jest</strong>.">Banco <strong>Supabase/PostgreSQL</strong> e testes unitários com <strong>Jest</strong>.</li>
                                <li data-en="Fluid interface with <strong>Tailwind</strong>, designed around the user experience.">Interface fluida com <strong>Tailwind</strong>, desenhada em torno da experiência do usuário.</li>
                            </ul>
                        </div>
                        <div className="project-entry">
                            <div className="project-header">
                                <h3 data-en="ECCO | Textile Art E-commerce">ECCO | E-commerce de Arte Têxtil</h3>
                            </div>
                            <ul>
                                <li data-en="Artisan marketplace with secure checkout via <strong>Stripe</strong> and <strong>Mercado Pago</strong>.">Marketplace artesanal com checkout seguro via <strong>Stripe</strong> e <strong>Mercado Pago</strong>.</li>
                                <li data-en="Automated shipping quotes with the <strong>Melhor Envio</strong> API and an admin panel that turns post-sale ops into one click.">Cálculo de frete automático com a API do <strong>Melhor Envio</strong> e painel admin que reduz o pós-venda a um clique.</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 data-en="Professional Experience">Experiência Profissional</h2>
                        <div className="job-entry">
                            <div className="job-header">
                                <h3>Becker&apos;s Chalets</h3>
                                <span className="small-text" data-en="Apr 2023 – Aug 2023 | Jasper National Park, Canada">Abr 2023 – Ago 2023 | Jasper National Park, Canadá</span>
                            </div>
                            <div className="job-role" data-en="Operations & Facilities Logistics">Suporte Operacional e Logística</div>
                            <ul>
                                <li data-en="Remote hospitality operation inside a Canadian national park, with a high degree of self-management.">Operação de hospitalidade remota dentro de um parque nacional canadense, com alto grau de autogestão.</li>
                                <li data-en="Kept premium chalets running end to end, from logistics to maintenance standards.">Mantive a operação de chalés premium de ponta a ponta, da logística aos padrões de manutenção.</li>
                            </ul>
                        </div>
                        <div className="job-entry">
                            <div className="job-header">
                                <h3>Hostel Climb House</h3>
                                <span className="small-text" data-en="Jun 2025 | Puerto Varas, Chile">Jun 2025 | Puerto Varas, Chile</span>
                            </div>
                            <div className="job-role" data-en="Operations & Guest Experience Coordinator">Coordenador de Operações e Experiência do Hóspede</div>
                            <ul>
                                <li data-en="Managed the front desk of an international hostel and an indoor climbing gym.">Gestão da recepção de um hostel internacional e de um ginásio de escalada.</li>
                                <li data-en="Trilingual service (English, Spanish, Portuguese), plus tour coordination and reservation management.">Atendimento trilíngue (inglês, espanhol, português), com coordenação de tours e gestão de reservas.</li>
                            </ul>
                        </div>
                    </section>

                    <div className="bottom-grid">
                        <section>
                            <h2 data-en="Education">Formação Acadêmica</h2>
                            <div style={{ marginBottom: '14px' }}>
                                <h3 data-en="Tamwood Careers (Canada)">Tamwood Careers (Canadá)</h3>
                                <p className="job-role" data-en="Web Development Certificate | 2022">Certificado em Web Development | 2022</p>
                            </div>
                            <div>
                                <h3 data-en="Mackenzie Presbyterian Univ. (Brazil)">Univ. Presbiteriana Mackenzie (Brasil)</h3>
                                <p className="job-role" data-en="Computer Science BSc (4 semesters)">Ciência da Computação (4 semestres)</p>
                            </div>
                        </section>
                        <section>
                            <h2 data-en="Beyond Code">Além do Código</h2>
                            <ul>
                                <li data-en="Solo backpacking expedition from Chile to Ushuaia, planned and executed on my own.">Expedição solo de mochilão do Chile até Ushuaia, planejada e executada por conta própria.</li>
                                <li data-en="Wildlife photography, trekking (Rockies and Patagonia), football and climbing.">Fotografia de vida selvagem, trekking (Rockies e Patagônia), futebol e escalada.</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResumePage;
