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
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="/app.css">
    <script src="https://unpkg.com/htmx.org@2.0.4"></script>
    <script defer src="https://unpkg.com/alpinejs@3.14.9/dist/cdn.min.js"></script>
</head>
<body class="font-sans text-[var(--color-hood-text)]">
<header class="border-b border-[var(--color-hood-border)] bg-[rgba(255,253,249,0.92)] backdrop-blur">
    <div class="shell flex items-center justify-between gap-6 py-5">
        <a class="flex items-center gap-3 text-lg font-extrabold uppercase tracking-[0.08em]" href="/">
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-hood-border-strong)] bg-[var(--color-hood-text)] text-sm text-white">H</span>
            <span>hood</span>
        </a>
        <nav class="hidden items-center gap-6 text-sm font-semibold uppercase tracking-[0.08em] md:flex">
            <a class="${page.path().equals("/") ? "text-[var(--color-hood-accent-strong)]" : "text-[var(--color-hood-text-muted)]"}" href="/">Home</a>
            <a class="${page.path().startsWith("/axis-1") ? "text-[var(--color-hood-accent-strong)]" : "text-[var(--color-hood-text-muted)]"}" href="/axis-1">Axis 1</a>
            <a class="${page.path().startsWith("/axis-2") ? "text-[var(--color-hood-accent-strong)]" : "text-[var(--color-hood-text-muted)]"}" href="/axis-2">Axis 2</a>
            <a class="${page.path().startsWith("/samples") ? "text-[var(--color-hood-accent-strong)]" : "text-[var(--color-hood-text-muted)]"}" href="/samples">Samples</a>
            <a class="${page.path().startsWith("/pricing") ? "text-[var(--color-hood-accent-strong)]" : "text-[var(--color-hood-text-muted)]"}" href="/pricing">Pricing</a>
        </nav>
        <a class="hidden rounded-md border border-[var(--color-hood-accent)] bg-[var(--color-hood-accent)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[var(--color-hood-accent-strong)] md:inline-flex" href="/start">Start a Project</a>
    </div>
</header>

<main>
    ${content}
</main>

<footer class="border-t border-[var(--color-hood-border)] bg-[#111518] py-12 text-[#f7f3ed]">
    <div class="shell grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div class="space-y-3">
            <p class="text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-hood-accent)]">hood</p>
            <p class="max-w-xl text-sm leading-7 text-[#d4ccc0]">
                Packet-first growth system for kitchen exhaust vendors. Public pages explain the product.
                Packets and internal ops flows create the paid utility.
            </p>
        </div>
        <div class="space-y-3 text-sm">
            <p class="font-semibold uppercase tracking-[0.12em] text-[#f2e8da]">Product</p>
            <div class="grid gap-2 text-[#d4ccc0]">
                <a href="/axis-1">Axis 1</a>
                <a href="/axis-2">Axis 2</a>
                <a href="/samples">Samples</a>
                <a href="/pricing">Pricing</a>
            </div>
        </div>
        <div class="space-y-3 text-sm">
            <p class="font-semibold uppercase tracking-[0.12em] text-[#f2e8da]">Workflow</p>
            <div class="grid gap-2 text-[#d4ccc0]">
                <a href="/start">Start</a>
                <a href="/ops/vendors">Ops Vendors</a>
            </div>
        </div>
    </div>
</footer>
</body>
</html>
