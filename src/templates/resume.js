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
            if (btn) btn.textContent = newLang === 'en' ? '🇧🇷 PT' : '🇺🇸 EN';
        };
    }, []);

    return (
        <>
            <Helmet>
                <title>Resume - Matheus M. Martinho</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
                <style>{`
          :root {
            --bg-color: #ffffff;
            --text-primary: #111111;
            --text-secondary: #555555;
            --accent-color: #000000;
            --border-color: #e0e0e0;
            --mono-font: 'JetBrains Mono', monospace;
            --sans-font: 'Inter', sans-serif;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background-color: #f4f4f4 !important;
            font-family: var(--sans-font);
            color: var(--text-primary);
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
          }
          .resume-container {
            background-color: var(--bg-color);
            width: 210mm;
            min-height: 297mm;
            margin: 40px auto;
            padding: 40px 50px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          }
          @media print {
            body { background-color: #fff !important; }
            .resume-container { width: 100%; margin: 0; padding: 30px 40px !important; box-shadow: none; }
            @page { margin: 0; }
            .lang-switch { display: none !important; }
          }
          @media (max-width: 768px) {
            .resume-container { width: 100%; margin: 0; padding: 20px; box-shadow: none; }
            .header { flex-direction: column; gap: 15px; }
            .contact-info { text-align: left !important; }
            .skills-grid { grid-template-columns: 1fr !important; }
            .bottom-grid { flex-direction: column; gap: 0; }
          }
          h1 { font-family: var(--mono-font); font-size: 2rem; font-weight: 700; letter-spacing: -1px; text-transform: uppercase; }
          h2 { font-family: var(--mono-font); font-size: 0.9rem; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary); border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin: 24px 0 16px 0; }
          h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 4px; }
          p, li { font-size: 0.95rem; color: var(--text-primary); }
          .small-text { font-family: var(--mono-font); font-size: 0.85rem; color: var(--text-secondary); }
          a { color: var(--text-primary); text-decoration: none; border-bottom: 1px dotted var(--text-secondary); }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
          .contact-info { text-align: right; font-family: var(--mono-font); }
          .contact-info div { margin-bottom: 4px; }
          .summary { font-size: 1.05rem; color: var(--text-secondary); margin-bottom: 30px; max-width: 90%; }
          .skills-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
          .skill-category strong { display: block; font-family: var(--mono-font); font-size: 0.85rem; text-transform: uppercase; margin-bottom: 8px; }
          .job-entry, .project-entry { margin-bottom: 20px; }
          .job-header, .project-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; flex-wrap: wrap; gap: 10px; }
          .job-role { font-weight: 500; color: var(--text-secondary); font-style: italic; }
          ul { list-style-type: none; padding-left: 0; }
          ul li { margin-bottom: 6px; padding-left: 20px; position: relative; }
          ul li::before { content: '■'; position: absolute; left: 0; color: var(--accent-color); font-size: 0.7rem; top: 4px; }
          .lang-switch { position: fixed; top: 40px; right: 40px; cursor: pointer; font-family: var(--mono-font); font-size: 0.85rem; border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 4px; transition: all 0.2s; background: rgba(255,255,255,0.95); z-index: 1000; }
          .lang-switch:hover { background: #eee; border-color: #999; }
          .bottom-grid { display: flex; gap: 40px; }
          .bottom-grid section { flex: 1; }
        `}</style>
            </Helmet>

            <div data-lang="pt">
                <button className="lang-switch" onClick={() => window.toggleLanguage && window.toggleLanguage()}>🇺🇸 EN</button>

                <div className="resume-container">
                    <header className="header">
                        <div>
                            <h1>Matheus M. Martinho</h1>
                            <div className="job-role" style={{ fontStyle: 'normal', marginTop: '5px', fontSize: '1.1rem' }} data-en="Full Stack Developer | Mobile & Web">
                                Desenvolvedor Full Stack | Mobile & Web
                            </div>
                        </div>
                        <div className="contact-info small-text">
                            <div data-en="São Paulo, SP (Remote Available)">São Paulo, SP</div>
                            <div>+55 (11) 98705-5693</div>
                            <div><a href="https://matheusmartinho.dev">matheusmartinho.dev</a></div>
                            <div><a href="mailto:matheusmouramartinho@hotmail.com">matheusmouramartinho@hotmail.com</a></div>
                        </div>
                    </header>

                    <section className="summary">
                        <p data-en="Multidisciplinary developer combining Computer Science theoretical foundation with global operational experience. Specialist in building Full Stack applications using <strong>React, Next.js and TypeScript</strong>. Highly adaptable professional, shaped in high-pressure international hospitality environments. Proven skill in using modern AI tools (Cursor/Windsurf) to accelerate development cycles.">
                            Desenvolvedor multidisciplinar que une a base teórica da Ciência da Computação com vivência operacional global. Especialista na construção de aplicações Full Stack utilizando <strong>React, Next.js e TypeScript</strong>. Profissional com alta adaptabilidade, moldado em ambientes de alta pressão na hospitalidade internacional. Habilidade comprovada no uso de ferramentas modernas de IA (Cursor/Windsurf) para acelerar ciclos de desenvolvimento.
                        </p>
                    </section>

                    <section>
                        <h2 data-en="Technical Skills">Competências Técnicas</h2>
                        <div className="skills-grid">
                            <div className="skill-category">
                                <strong>Frontend & Mobile</strong>
                                React.js, React Native, Next.js, TypeScript, Tailwind CSS, HTML5.
                            </div>
                            <div className="skill-category">
                                <strong data-en="Backend & Data">Backend & Dados</strong>
                                <span data-en="SQL, PostgreSQL, Node.js (Basic), REST API Integration.">SQL, PostgreSQL, Node.js (Básico), Integração de APIs REST.</span>
                            </div>
                            <div className="skill-category">
                                <strong>Workflow & Tools</strong>
                                <span data-en="Git/GitHub, Jest (Testing), Figma, AI Assisted Dev.">Git/GitHub, Jest (Testes), Figma, Desenvolvimento Assistido por IA.</span>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 data-en="Notable Projects">Projetos em Destaque</h2>
                        <div className="project-entry">
                            <div className="project-header">
                                <h3 data-en="The Pitch | Social Check-in App for Stadiums">The Pitch | App de Check-in Social em Estádios</h3>
                            </div>
                            <ul>
                                <li data-en="Engineered a social check-in app with <strong>GPS verification</strong> for Brazilian football fans, built in <strong>React Native + Expo SDK 55</strong>.">Engenharia de app de check-in social com <strong>verificação por GPS</strong> para torcedores brasileiros em estádios, em <strong>React Native + Expo SDK 55</strong>.</li>
                                <li data-en="Real-time social feed with predictions, polls and group chat powered by <strong>Supabase Realtime</strong>.">Feed social em tempo real com palpites, enquetes e grupos com chat via <strong>Supabase Realtime</strong>.</li>
                                <li data-en="Gamification system with <strong>XP</strong>, levels and Bronze→Diamond badges to reward in-person attendance.">Sistema de gamificação com <strong>XP</strong>, níveis e badges Bronze→Diamond para recompensar presença ao vivo.</li>
                                <li data-en="Production deployment via <strong>EAS</strong> with OTA updates, push notifications and offline-first architecture for low-signal stadium environments.">Deploy em produção via <strong>EAS</strong> com OTA updates, push notifications e arquitetura offline-first para sinal fraco no estádio.</li>
                            </ul>
                        </div>
                        <div className="project-entry">
                            <div className="project-header">
                                <h3 data-en="Cinelog | Social Network for Cinephiles">Cinelog | Rede Social para Cinéfilos</h3>
                            </div>
                            <ul>
                                <li data-en="Engineered a <em>mobile-first</em> social platform using <strong>React Native</strong> and <strong>Next.js</strong>.">Engenharia de uma plataforma social <em>mobile-first</em> utilizando <strong>React Native</strong> e <strong>Next.js</strong>.</li>
                                <li data-en="Implemented robust <strong>Supabase/PostgreSQL</strong> database and system validation with <strong>Jest</strong> unit tests.">Implementação de banco de dados <strong>Supabase/PostgreSQL</strong> robusto e validação do sistema com testes unitários em <strong>Jest</strong>.</li>
                                <li data-en="Fluid and artistic interface design with <strong>Tailwind</strong>, prioritizing user experience.">Design de interface fluida e artística com <strong>Tailwind</strong>, priorizando a experiência do usuário.</li>
                            </ul>
                        </div>
                        <div className="project-entry">
                            <div className="project-header">
                                <h3 data-en="Ecco | E-commerce Platform">Ecco | Plataforma de E-commerce</h3>
                            </div>
                            <ul>
                                <li data-en="Construction of a functional artisanal marketplace integrating <strong>Stripe</strong> and <strong>Mercado Pago</strong> for secure checkouts.">Construção de um marketplace artesanal funcional integrando <strong>Stripe</strong> e <strong>Mercado Pago</strong> para checkouts seguros.</li>
                                <li data-en="Logistics calculation automation consuming <strong>Melhor Envio</strong> API, creating a fluid shopping experience.">Automação de cálculo logístico consumindo a API do <strong>Melhor Envio</strong>, criando uma experiência de compra fluida.</li>
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
                            <div className="job-role" data-en="Operational Support & Facilities Logistics">Suporte Operacional e Logística de Instalações</div>
                            <ul>
                                <li data-en="<strong>Resilience Factor:</strong> Role in remote hospitality hub, requiring extreme self-management and adaptability in the Rocky Mountains."><strong>Fator Resiliência:</strong> Atuação em hub de hospitalidade remoto, exigindo extrema autogestão e adaptabilidade nas Montanhas Rochosas.</li>
                                <li data-en="Ensured operational continuity of facilities, managing logistics and premium maintenance standards.">Garantia da continuidade operacional das instalações, gerenciando logística e padrões de manutenção premium.</li>
                            </ul>
                        </div>
                        <div className="job-entry">
                            <div className="job-header">
                                <h3>Hostel Climb House</h3>
                                <span className="small-text" data-en="Jun 2025 | Puerto Varas, Chile">Jun 2025 | Puerto Varas, Chile</span>
                            </div>
                            <div className="job-role" data-en="Operations & Guest Experience Coordinator">Coordenador de Operações e Experiência do Hóspede</div>
                            <ul>
                                <li data-en="<strong>Dual Management:</strong> Management of international hostel reception and climbing sports facility."><strong>Gestão Dupla:</strong> Gerenciamento da recepção do hostel internacional e da instalação esportiva de escalada.</li>
                                <li data-en="<strong>Trilingual</strong> focal point (English/Spanish/Portuguese), mediating cultural differences and ensuring 5-star experience.">Ponto focal <strong>trilíngue (Inglês/Espanhol/Português)</strong>, mediando diferenças culturais e garantindo experiência 5 estrelas.</li>
                                <li data-en="Logistical coordination of adventure tours and reservation management via internal systems.">Coordenação logística de tours de aventura e gestão de reservas via sistemas internos.</li>
                            </ul>
                        </div>
                    </section>

                    <div className="bottom-grid">
                        <section>
                            <h2 data-en="Education">Formação Acadêmica</h2>
                            <div style={{ marginBottom: '15px' }}>
                                <h3>Tamwood Careers (Canadá)</h3>
                                <p className="job-role" data-en="Web Development Certificate | 2022">Certificado em Web Development | 2022</p>
                            </div>
                            <div>
                                <h3 data-en="Mackenzie Presbyterian Univ. (Brazil)">Univ. Presbiteriana Mackenzie (Brasil)</h3>
                                <p className="job-role" data-en="Computer Science BSc (4 Semesters)">Bacharelado em Ciência da Computação (4 Sem.)</p>
                            </div>
                        </section>
                        <section>
                            <h2 data-en="Interests & Achievements">Interesses & Conquistas</h2>
                            <ul>
                                <li data-en="<strong>Solo Expedition:</strong> Backpacking from Chile to Ushuaia ('The End of the World'), demonstrating planning and independence."><strong>Expedição Solo:</strong> Mochilão do Chile até o Ushuaia (&quot;O Fim do Mundo&quot;), demonstrando planejamento e independência.</li>
                                <li data-en="<strong>Active Lifestyle:</strong> Trekking (Rockies & Patagonia), competitive football and climbing."><strong>Lifestyle Ativo:</strong> Trekking (Montanhas Rochosas & Patagônia), futebol competitivo e escalada.</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResumePage;
