@import owner.hood.web.common.PageMeta
@import gg.jte.Content
@param PageMeta page
@param Content content

<!DOCTYPE html>
<html lang="en" data-theme="hood">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.title()}</title>
    <meta name="description" content="${page.description()}">
    <meta name="robots" content="${page.robots()}">
    <link rel="canonical" href="${page.canonicalUrl()}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="/app.css">
    <script src="https://unpkg.com/htmx.org@2.0.4"></script>
    <script defer src="https://unpkg.com/alpinejs@3.14.9/dist/cdn.min.js"></script>
</head>
<body class="font-sans text-[var(--color-hood-text)]">
<header class="border-b border-black/8 bg-[rgba(255,255,255,0.96)] backdrop-blur">
    <div class="shell flex items-center justify-between gap-6 py-4">
        <a class="flex items-center gap-3" href="/">
            <svg class="h-5 w-5 text-[var(--color-hood-accent)]" fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.3 2.2C11.2 4.4 13 5.2 13 7.6C13 10.2 11.1 11.7 9.4 13.2C8 14.4 7.1 15.5 7.1 17.3C4.7 16.4 3.2 14.2 3.2 11.5C3.2 7.6 6 5.5 10.3 2.2Z" fill="currentColor"/>
                <path d="M12.3 9.2C13.7 10.2 14.7 11.5 14.7 13.4C14.7 16 12.6 17.9 10 17.9C8.8 17.9 7.8 17.5 6.9 16.8C6.9 15.1 7.8 14.1 9 13.1C10.5 11.9 12.3 10.9 12.3 9.2Z" fill="#fffdfa"/>
            </svg>
            <span class="text-[1.85rem] font-black uppercase tracking-[-0.06em]">hood</span>
        </a>
        <nav class="hidden items-center gap-10 text-[0.92rem] font-bold uppercase tracking-[0.14em] md:flex">
            <a class="${page.path().equals("/") ? "text-[var(--color-hood-accent-strong)]" : "text-[var(--color-hood-text-muted)]"} transition" href="/">Solutions</a>
            <a class="${page.path().startsWith("/axis-1") ? "text-[var(--color-hood-accent-strong)]" : "text-[var(--color-hood-text-muted)]"} transition" href="/axis-1">Compliance</a>
            <a class="${page.path().startsWith("/axis-2") ? "text-[var(--color-hood-accent-strong)]" : "text-[var(--color-hood-text-muted)]"} transition" href="/axis-2">Inventory</a>
            <a class="${page.path().startsWith("/pricing") ? "text-[var(--color-hood-accent-strong)]" : "text-[var(--color-hood-text-muted)]"} transition" href="/pricing">Pricing</a>
        </nav>
        <div class="hidden items-center gap-4 md:flex">
            <a class="text-sm font-medium text-[var(--color-hood-text-muted)] transition hover:text-[var(--color-hood-text)]" href="/samples">Client Portal</a>
            <a class="inline-flex border border-[var(--color-hood-accent)] bg-[var(--color-hood-accent)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--color-hood-accent-strong)]" href="/start">Request Audit</a>
        </div>
    </div>
</header>

<main>
    ${content}
</main>

<footer class="border-t border-black/8 bg-[#f7f4ee] py-12">
    <div class="shell grid gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
        <div class="space-y-3">
            <p class="text-[1.5rem] font-black uppercase tracking-[-0.05em] text-black/35">hood</p>
            <p class="max-w-xl text-sm leading-7 text-black/58">
                Packet-grade operating system for kitchen exhaust vendors.
                Public pages sell the shape of the work. The packet carries the real value.
            </p>
        </div>
        <div class="space-y-3 text-sm">
            <p class="font-bold uppercase tracking-[0.14em] text-black/65">Product</p>
            <div class="grid gap-2 uppercase tracking-[0.08em] text-black/52">
                <a href="/axis-1">Axis 1</a>
                <a href="/axis-2">Axis 2</a>
                <a href="/samples">Samples</a>
                <a href="/pricing">Pricing</a>
            </div>
        </div>
        <div class="space-y-3 text-sm">
            <p class="font-bold uppercase tracking-[0.14em] text-black/65">Workflow</p>
            <div class="grid gap-2 uppercase tracking-[0.08em] text-black/52">
                <a href="/start">Start</a>
                <a href="/ops/vendors">Ops Vendors</a>
            </div>
        </div>
    </div>
</footer>
</body>
</html>
