<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>GradShop</title>
        <style>
            :root {
                --color-background: #f4f3ee;
                --color-surface: #ffffff;
                --color-surface-soft: #faf8f5;
                --color-border: #bcb8b1;
                --color-brand: #8a817c;
                --color-brand-strong: #736b66;
                --color-text: #020202;
                --color-text-soft: rgba(2, 2, 2, 0.74);
                --color-text-faint: rgba(138, 129, 124, 0.88);
                --color-accent: #e0afa0;
            }

            * {
                box-sizing: border-box;
            }

            body {
                margin: 0;
                min-height: 100vh;
                font-family: "Segoe UI", sans-serif;
                color: var(--color-text);
                background:
                    radial-gradient(circle at top left, rgba(224, 175, 160, 0.18), transparent 24%),
                    radial-gradient(circle at top right, rgba(188, 184, 177, 0.2), transparent 24%),
                    linear-gradient(180deg, #f7f5f1 0%, #f4f3ee 48%, #efebe4 100%);
            }

            a {
                color: inherit;
                text-decoration: none;
            }

            .shell {
                width: min(1120px, calc(100% - 32px));
                margin: 0 auto;
                padding: 28px 0 40px;
            }

            .topbar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                margin-bottom: 32px;
            }

            .brand {
                font-size: 2rem;
                font-weight: 700;
                letter-spacing: -0.03em;
            }

            .nav {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }

            .nav a,
            .button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-height: 44px;
                padding: 0 18px;
                border-radius: 999px;
                border: 1px solid var(--color-border);
                background: rgba(255, 255, 255, 0.82);
                color: var(--color-text);
                font-size: 0.95rem;
                font-weight: 600;
            }

            .button-primary {
                background: var(--color-brand);
                border-color: var(--color-brand);
            }

            .hero {
                display: grid;
                gap: 24px;
                grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
                align-items: stretch;
            }

            .card {
                border: 1px solid rgba(188, 184, 177, 0.72);
                border-radius: 32px;
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(244, 243, 238, 0.9));
                box-shadow: 0 18px 44px rgba(138, 129, 124, 0.12);
            }

            .hero-copy {
                padding: 40px;
            }

            .eyebrow {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                padding: 10px 14px;
                border-radius: 999px;
                border: 1px solid rgba(224, 175, 160, 0.7);
                background: rgba(255, 255, 255, 0.82);
                color: var(--color-brand);
                font-size: 0.75rem;
                font-weight: 700;
                letter-spacing: 0.2em;
                text-transform: uppercase;
            }

            .eyebrow::before {
                content: "";
                width: 8px;
                height: 8px;
                border-radius: 999px;
                background: var(--color-accent);
            }

            h1 {
                margin: 22px 0 0;
                font-size: clamp(3rem, 7vw, 5rem);
                line-height: 0.92;
                letter-spacing: -0.04em;
            }

            .lead {
                max-width: 42rem;
                margin: 22px 0 0;
                color: var(--color-text-soft);
                font-size: 1rem;
                line-height: 1.9;
            }

            .actions {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
                margin-top: 28px;
            }

            .hero-side {
                padding: 32px;
                background:
                    linear-gradient(160deg, rgba(255, 255, 255, 0.92), rgba(188, 184, 177, 0.24));
            }

            .stack {
                display: grid;
                gap: 14px;
            }

            .mini {
                border-radius: 22px;
                border: 1px solid rgba(188, 184, 177, 0.72);
                background: rgba(255, 255, 255, 0.78);
                padding: 18px;
            }

            .mini-label {
                color: var(--color-text-faint);
                font-size: 0.72rem;
                font-weight: 700;
                letter-spacing: 0.18em;
                text-transform: uppercase;
            }

            .mini-value {
                margin-top: 10px;
                font-size: 1.5rem;
                font-weight: 700;
                letter-spacing: -0.03em;
                color: var(--color-brand);
            }

            .mini-copy {
                margin-top: 10px;
                color: var(--color-text-soft);
                font-size: 0.95rem;
                line-height: 1.7;
            }

            .footer-note {
                margin-top: 28px;
                color: var(--color-text-faint);
                font-size: 0.85rem;
            }

            @media (max-width: 920px) {
                .hero {
                    grid-template-columns: 1fr;
                }

                .hero-copy,
                .hero-side {
                    padding: 28px;
                }

                .topbar {
                    flex-direction: column;
                    align-items: flex-start;
                }
            }
        </style>
    </head>
    <body>
        <div class="shell">
            <div class="topbar">
                <div class="brand">GradShop</div>
                <div class="nav">
                    <a href="{{ url('/') }}">Overview</a>
                    <a href="{{ url('/login') }}">Login</a>
                    <a class="button-primary" href="{{ url('/register') }}">Register</a>
                </div>
            </div>

            <section class="hero">
                <div class="card hero-copy">
                    <div class="eyebrow">Marketplace Platform</div>
                    <h1>Elegant commerce for curated, mobile-first experiences.</h1>
                    <p class="lead">
                        This backend entry page now uses the same neutral premium palette as the rest of the project, so the application no longer falls back to Laravel's default gray and red welcome screen.
                    </p>
                    <div class="actions">
                        <a class="button button-primary" href="{{ url('/api') }}">API Surface</a>
                        <a class="button" href="http://localhost:5173">Open Frontend App</a>
                    </div>
                    <p class="footer-note">
                        Background uses #F4F3EE, borders use #BCB8B1, primary emphasis uses #8A817C, and #E0AFA0 is reserved for small highlights.
                    </p>
                </div>

                <aside class="card hero-side">
                    <div class="stack">
                        <div class="mini">
                            <div class="mini-label">Background</div>
                            <div class="mini-value">#F4F3EE</div>
                            <div class="mini-copy">The dominant page tone for a softer, cleaner application shell.</div>
                        </div>
                        <div class="mini">
                            <div class="mini-label">Interface Border</div>
                            <div class="mini-value">#BCB8B1</div>
                            <div class="mini-copy">Used for restrained outlines, quiet panels, and secondary surfaces.</div>
                        </div>
                        <div class="mini">
                            <div class="mini-label">Primary Actions</div>
                            <div class="mini-value">#8A817C</div>
                            <div class="mini-copy">Reserved for branded emphasis, active controls, and navigation weight.</div>
                        </div>
                    </div>
                </aside>
            </section>
        </div>
    </body>
</html>
