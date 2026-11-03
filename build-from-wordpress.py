"""Turn the mirrored WordPress site (murphybedpros.com) into a static site for Cloudflare Workers (static assets)."""
import os, re, glob, shutil
from bs4 import BeautifulSoup, Comment
SRC = '/home/claude/src-murphy/site'
OUT = '/home/claude/murphybedpros-site/public'
DOMAIN = 'murphybedpros.com'

def rel(s):
    """Make same-site URLs root-relative (works on workers.dev previews and the real domain)."""
    s = re.sub(r'https?:\\/\\/(?:www\.)?murphybedpros\.com(?![\w.-])', '', s)  # JSON-escaped, inside inline scripts
    return re.sub(r'(?:https?:)?//(?:www\.)?murphybedpros\.com(?![\w.-])', '', s)

# Scripts that need WordPress running: the GPT "AI content generator" plugin's chat/form widgets and the emoji loader
DROP_SCRIPT = re.compile(r'^(wp-ai-content-generator|wpaicg-[\w-]+|wp-emoji-settings)(-js)*(-extra|-before|-after)?$')

def clean(path, t):
    s = BeautifulSoup(t, 'lxml')
    for l in s.select('link'):
        r = ' '.join(l.get('rel', []))
        href = l.get('href') or ''
        if r in ('EditURI', 'wlwmanifest', 'https://api.w.org/', 'pingback', 'shortlink') or (
                r == 'alternate' and l.get('type') in ('application/json', 'application/rss+xml', 'application/json+oembed', 'text/xml+oembed')):
            l.decompose()
        elif 'gpt3-ai-content-generator' in href:
            l.decompose()
    for sc in s.find_all('script'):
        body = sc.string or ''
        if DROP_SCRIPT.match(sc.get('id', '')) or 'script#wp-emoji-settings' in body or 'gpt3-ai-content-generator' in (sc.get('src') or ''):
            sc.decompose()
    # Comment forms and reply links (existing comments stay visible; a static site can't take new ones)
    for e in s.select('#respond, .comment-respond, .comment-reply-link, .ast-comment-edit-reply-wrap'):
        if not e.decomposed: e.decompose()
    # rewrite same-site URLs, but keep canonical/og/ld+json absolute for SEO
    for tag in s.find_all(True):
        for k, v in list(tag.attrs.items()):
            if isinstance(v, list): continue
            if tag.name == 'link' and k == 'href' and 'canonical' in tag.get('rel', []): continue
            if tag.name == 'meta' and k == 'content': continue
            if isinstance(v, str) and DOMAIN in v: tag[k] = rel(v)
    for c in s.find_all(string=lambda x: isinstance(x, Comment)):
        if DOMAIN in c: c.replace_with(Comment(rel(str(c))))
    for sc in s.find_all(['script', 'style']):
        if sc.get('type') == 'application/ld+json': continue
        if sc.string and DOMAIN in sc.string: sc.string = rel(sc.string)
    return s

def page_files():
    for f in glob.glob(SRC + '/**/index.html', recursive=True):
        p = os.path.relpath(os.path.dirname(f), SRC)
        p = 'index' if p == '.' else p
        if p.startswith(('wp-content', 'wp-includes')): continue
        yield p, f

if os.path.exists(OUT): shutil.rmtree(OUT)
os.makedirs(OUT)
# assets keep their WordPress paths, so relative url()s inside the theme/plugin CSS keep working
for d in ('wp-content', 'wp-includes'):
    if os.path.isdir(f'{SRC}/{d}'):
        shutil.copytree(f'{SRC}/{d}', f'{OUT}/{d}', ignore=lambda dirpath, names: [n for n in names if os.path.isfile(os.path.join(dirpath, n)) and os.path.getsize(os.path.join(dirpath, n)) == 0])
# Files the old server answered with its "page not found" HTML (the images were already missing on the live
# site) are left out, so they get a normal 404 instead of an HTML page posing as an image
dropped = 0
for root, dirs, files in os.walk(OUT):
    for n in files:
        fp = os.path.join(root, n)
        if not n.endswith(('.html', '.htm')):
            with open(fp, 'rb') as fh: head = fh.read(64).lstrip().lower()
            if head.startswith((b'<!doctype html', b'<html')): os.remove(fp); dropped += 1
print('dropped error-page files', dropped)
kept = []
for p, f in sorted(page_files()):
    t = open(f, encoding='utf-8', errors='replace').read()
    dst = OUT + '/index.html' if p == 'index' else f'{OUT}/{p}/index.html'
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    open(dst, 'w').write(str(clean(p, t)))
    kept.append('/' if p == 'index' else f'/{p}/')

# 404 page: the About page with its body swapped out
s = clean('404', open(SRC + '/about/index.html').read())
c = s.select_one('.entry-content'); c.clear()
c.append(BeautifulSoup('<p>The page you were looking for has moved or no longer exists.</p><p><a href="/">Back to home</a> &middot; <a href="/shop/">Shop online</a></p>', 'html.parser'))
s.select_one('h1.entry-title').string = 'Page not found'
s.title.string = 'Page not found – Murphy Bed Pros'
for l in s.select('link[rel=canonical], meta[property="og:url"], meta[property="og:title"], meta[name=description], meta[property="og:description"], script[type="application/ld+json"]'): l.decompose()
for li in s.select('.current-menu-item, .current_page_item'):
    li['class'] = [x for x in li.get('class', []) if x not in ('current-menu-item', 'current_page_item')]
s.head.append(s.new_tag('meta', attrs={'name': 'robots', 'content': 'noindex'}))
open(OUT + '/404.html', 'w').write(str(s))

# sitemap and robots (WordPress served /wp-sitemap.xml; the new one is /sitemap.xml and the old addresses redirect)
skip = re.compile(r'(^|/)page/\d+/$|^/type/')
urls = sorted(u for u in kept if not skip.search(u))
open(OUT + '/sitemap.xml', 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    ''.join(f'  <url><loc>https://www.{DOMAIN}{u}</loc></url>\n' for u in urls) + '</urlset>\n')
# AdSense publisher file (the old site had none; same publisher ID as the ads on the pages)
open(OUT + '/ads.txt', 'w').write('google.com, pub-6564027149745277, DIRECT, f08c47fec0942fa0\n')
open(OUT + '/robots.txt', 'w').write(f'User-agent: *\nAllow: /\n\nSitemap: https://www.{DOMAIN}/sitemap.xml\n')
red = ['# WordPress endpoints, feeds and sitemaps',
       '/feed/   /   301', '/comments/feed/   /   301', '/wp-login.php   /   301', '/wp-admin/   /   301', '/xmlrpc.php   /   301',
       '/wp-sitemap.xml   /sitemap.xml   301', '/wp-sitemap-*   /sitemap.xml   301', '/sitemap_index.xml   /sitemap.xml   301',
       '/*/feed/   /:splat/   301']
open(OUT + '/_redirects', 'w').write('\n'.join(red) + '\n')
print('pages', len(kept), 'sitemap', len(urls))
