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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="/app.css">
</head>
<body class="bg-[var(--color-hood-bg)] font-sans text-[var(--color-hood-text)]">
<header class="border-b border-[var(--color-hood-border)] bg-[var(--color-hood-surface)]">
    <div class="shell flex items-center justify-between py-4">
        <div>
            <a class="text-xl font-extrabold uppercase tracking-[0.08em]" href="/ops/vendors">hood ops</a>
            <p class="mt-1 text-sm text-[var(--color-hood-text-muted)]">Internal workflow for vendor setup and packet generation</p>
        </div>
        <nav class="flex flex-wrap gap-4 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-hood-text-muted)]">
            <a href="/ops/vendors">Vendors</a>
            <a href="/ops/inquiries">Inquiries</a>
            <a href="/ops/orders">Orders</a>
            <a href="/ops/axis-2/projects">Axis 2</a>
            <a href="/ops/outbound/prospects">Outbound</a>
            <a href="/pricing">Pricing</a>
            <a href="/">Public site</a>
        </nav>
    </div>
</header>
<main class="py-10">
    ${content}
</main>
</body>
</html>
