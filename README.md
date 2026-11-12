# Katalog Digital Epson EcoTank

Katalog statis bergaya macOS untuk **46 printer Ink Tank Epson Indonesia**. Data diambil dari
[epson.co.id › Ink Tank](https://www.epson.co.id/Untuk-Rumah/Printer-untuk-Rumah/c/ink-tank).

## Fitur
- Tampilan jendela ala macOS: menu bar, traffic lights, sidebar ala Finder, efek frosted glass
- Mode terang/gelap (otomatis mengikuti sistem, bisa diganti manual)
- Filter kategori, fitur (Wi-Fi, Duplex, ADF, A3+, dll.) dan kode tinta
- Pencarian Spotlight (`⌘K` / `Ctrl+K` / `/`)
- Halaman detail berisi spesifikasi lengkap, dengan deep link `#/p/L3211`
- Perbandingan hingga 4 model lewat Dock, bisa dibagikan via `#/compare/L3211,L3251`
- Tampilan grid dan daftar, responsif di mobile
- Tanpa build step dan tanpa dependensi: HTML, CSS dan JS biasa

## Menjalankan secara lokal
```bash
python -m http.server 8000
# buka http://localhost:8000
```

## Publish ke GitHub Pages
```bash
git init && git add . && git commit -m "Katalog Epson EcoTank"
git branch -M main
git remote add origin https://github.com/<username>/epson-ecotank-catalog.git
git push -u origin main
```
Lalu buka **Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / root**.

## Memperbarui data
`scripts/build_data.py` membuat ulang `assets/data/products.js` dan mengunduh gambar produk dari
hasil scraping (`products.json` serta HTML halaman listing). Klasifikasi kategori, tagline dan kode tinta
diatur manual di dict `CURATED`.

## Struktur
```
index.html
assets/css/style.css
assets/js/app.js
assets/data/products.js   # data produk (dibuat otomatis)
assets/img/*.jpg          # foto produk
scripts/build_data.py
```

## Disclaimer
Proyek independen dan tidak berafiliasi dengan Seiko Epson Corporation. Epson, EcoTank dan foto produk
adalah merek dagang atau hak cipta milik pemiliknya masing-masing. Harga tidak tersedia di situs resmi.
Spesifikasi dapat berubah, jadi selalu cek ulang di situs resmi Epson.
