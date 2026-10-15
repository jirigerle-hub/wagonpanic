# Wagon Panic

Jednoduchý český web s hratelnou ukázkou železniční logické hry. Bez externích
knihoven, registrace nebo stahování.

## Spuštění

Otevřete `index.html` přímo v prohlížeči, nebo v kořenové složce spusťte:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Web bude dostupný na <http://127.0.0.1:8000>. S nainstalovaným npm lze použít
také `npm start` (vyžaduje Python 3). Žádná instalace balíčků ani sestavení není potřeba.
Kontrolu syntaxe JavaScriptu spustíte pomocí `npm run check` (vyžaduje Node.js).

## Jak hrát

Spusťte směnu, vyberte výhybku A, B nebo C podle barvy a písmene vagonu
a stiskněte **Odeslat vagon**. Oranžové vagony patří do depa A, modré do B
a zelené do C. Za správné doručení získáte 100 bodů; směna má osm vagonů
a není časově omezená. Tlačítkem ↻ lze směnu kdykoliv resetovat.

Ovládání funguje i klávesnicí: pomocí Tab vyberte tlačítko a aktivujte jej
klávesou Enter nebo mezerníkem. Web respektuje systémové omezení animací.