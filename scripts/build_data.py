"""Build assets/data/products.js from scraped Epson Indonesia data.

Usage: python scripts/build_data.py <products.json> <listing1.html> [<listing2.html> ...]
Downloads product images into assets/img/ and writes assets/data/products.js.
"""
import html, json, re, sys, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "img"
OUT = ROOT / "assets" / "data" / "products.js"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"}

# model -> (category id, short tagline, ink code)
CURATED = {
    "L121":   ("print", "Printer warna paling dasar dan ringkas untuk kebutuhan cetak harian.", "664"),
    "L1256":  ("print", "Printer warna ringkas dengan Wi-Fi dan cetak langsung dari smartphone.", "003"),
    "L1310":  ("print", "Generasi baru, bodi lebih ringkas, hasil hitam hingga 4.700 halaman.", "003"),
    "L1350":  ("print", "Generasi baru dengan Wi-Fi dan Wi-Fi Direct hingga 8 perangkat.", "003"),
    "L11050": ("a3", "Printer warna A3+ dengan LCD 4,3\" untuk poster dan dokumen lebar.", "003"),
    "L3211":  ("aio", "All-in-One TKDN (66,45%): cetak, pindai, salin hemat biaya.", "003"),
    "L3216":  ("aio", "All-in-One putih: cetak, pindai, salin hemat biaya.", "003"),
    "L3251":  ("aio", "All-in-One Wi-Fi TKDN tertinggi (75,28%) dengan Epson Smart Panel.", "003"),
    "L3256":  ("aio", "All-in-One putih dengan Wi-Fi dan Epson Smart Panel.", "003"),
    "L3311":  ("aio", "All-in-One generasi baru 2026 dengan desain yang lebih ringkas.", "003"),
    "L3316":  ("aio", "Varian L3311 dengan desain baru yang ringkas.", "003"),
    "L3351":  ("aio", "All-in-One Wi-Fi generasi baru 2026 dengan Epson Smart Panel.", "003"),
    "L3356":  ("aio", "Varian L3351: All-in-One Wi-Fi generasi baru.", "003"),
    "L3550":  ("aio", "All-in-One lebih cepat hingga 15 ipm, Wi-Fi dan Ethernet.", "003"),
    "L3556":  ("aio", "Varian L3550: cepat, Wi-Fi dan Ethernet.", "003"),
    "L4360":  ("aio", "All-in-One dengan cetak dua sisi otomatis dan LCD warna.", "001"),
    "L5290":  ("office", "Cetak, pindai, salin, faks dengan ADF untuk kantor kecil.", "003"),
    "L5296":  ("office", "Varian L5290 dengan ADF dan faks.", "003"),
    "L5391":  ("office", "Generasi baru dengan ADF, faks, Ethernet dan Wi-Fi.", "003"),
    "L5590":  ("office", "Lebih cepat hingga 15 ipm, lengkap dengan ADF dan faks.", "003"),
    "L6260":  ("office", "Duplex otomatis, LCD 2,4\", tinta hitam pigmen yang tajam.", "001"),
    "L6370":  ("office", "Duplex, ADF dan baki 250 lembar untuk produktivitas.", "001"),
    "L6390":  ("office", "Lengkap: duplex, ADF, faks dan layar sentuh 2,4\".", "001"),
    "L6460":  ("office", "Duplex dan ADF dengan kecepatan hingga 15 ipm.", "008"),
    "L6490":  ("office", "Duplex, ADF dan faks untuk kantor yang sibuk.", "008"),
    "L14150": ("a3", "All-in-One A3+ dengan duplex, ADF, faks dan Ethernet.", "001"),
    "L6550":  ("a3", "Bisnis A3 (TKDN 44,29%), tinta pigmen, 2 kaset kertas 250 lembar.", "008"),
    "L6580":  ("a3", "Bisnis A3 berkinerja tinggi (TKDN 43,81%) dengan tinta pigmen.", "008"),
    "L15150": ("a3", "A3 penuh (TKDN 68,94%): cetak, pindai, salin dan duplex hingga A3.", "008"),
    "L15160": ("a3", "A3 penuh (TKDN 67,05%) dengan kecepatan hingga 25 ipm.", "008"),
    "L15180": ("a3", "A3 penuh (TKDN 67,02%) dengan layar sentuh 4,3\" & Smart Panel.", "008"),
    "L8050":  ("photo", "Printer foto 6 warna A4 dengan tetesan 1,5 pl.", "057"),
    "L18050": ("photo", "Printer foto 6 warna A3+ untuk kreator dan studio.", "057"),
    "L8100":  ("photo", "All-in-One foto 6 warna dengan layar 2,4\".", "057"),
    "M1050":  ("mono", "Printer mono generasi baru dengan Wi-Fi dan Ethernet.", "005"),
    "M1100":  ("mono", "Printer mono ringkas untuk dokumen hitam-putih volume tinggi.", "005"),
    "M1120":  ("mono", "Printer mono dengan Wi-Fi.", "005"),
    "M1140":  ("mono", "Printer mono dengan duplex otomatis dan kaset 250 lembar.", "005"),
    "M1170":  ("mono", "Mono All-in-One dengan ADF, faks, duplex dan jaringan.", "005"),
    "M2050":  ("mono", "Mono All-in-One generasi baru dengan ADF dan Wi-Fi.", "005"),
    "M2140":  ("mono", "Mono All-in-One dengan duplex otomatis.", "005"),
    "M2170":  ("mono", "Mono All-in-One dengan ADF, faks dan duplex.", "005"),
    "M3170":  ("mono", "Mono All-in-One dengan layar sentuh 2,4\", ADF dan faks.", "005"),
    "M15140": ("mono", "Mono A3 (TKDN 69,82%) hingga 32 ppm dengan duplex A3.", "005"),
    "M15180": ("mono", "Mono A3 kelas bisnis (TKDN 69,82%) dengan layar sentuh 4,3\".", "005"),
    "WF-100": ("portable", "Printer portabel dengan baterai, hanya 1,6 kg.", "T289/T290"),
}
NEW_2026 = {"L1310", "L1350", "L3311", "L3316", "L3351", "L3356", "L4360", "L5391", "L6370", "L6390", "M1050", "M2050"}
# Data resmi TKDN Epson (Valid efektif per 28 Agustus 2026): model -> (kode, nilai_tkdn, nilai_bmp, total, no_sertifikat)
TKDN = {
    "L3211":  ("C11CJ68504", "52,80%", "13,65%", "66,45%", "6109/SJ-IND.8/E-TKDN/5/2025"),
    "L3251":  ("C11CJ67506", "61,63%", "13,65%", "75,28%", "6109/SJ-IND.8/E-TKDN/5/2025"),
    "L15150": ("C11CH72502", "55,29%", "13,65%", "68,94%", "5391/SJ-IND.8/TKDN/LVI/06/2026"),
    "L15160": ("C11CH71501", "53,40%", "13,65%", "67,05%", "6581/SJ-IND.8/TKDN/LVI/06/2026"),
    "L15180": ("C11CH71506", "53,37%", "13,65%", "67,02%", "6580/SJ-IND.8/TKDN/LVI/06/2026"),
    "M15140": ("C11CJ41501", "56,17%", "13,65%", "69,82%", "6579/SJ-IND.8/TKDN/LVI/06/2026"),
    "M15180": ("C11CJ41506", "56,17%", "13,65%", "69,82%", "6576/SJ-IND.8/TKDN/LVI/06/2026"),
    "L6550":  ("C11CJ30502", "30,64%", "13,65%", "44,29%", "720/SJ-IND.8/E-TKDN/3/2024"),
    "L6580":  ("C11CJ28502", "30,16%", "13,65%", "43,81%", "720/SJ-IND.8/E-TKDN/3/2024"),
}
# Spesifikasi resmi L3211 & L3251 dari Katalog Produk Epson TKDN FY25 (hal. 4)
TKDN_SPECS = {
    "L3211": {
        "Printer Type": {"Tipe Printer": "Print, Scan, Copy"},
        "Printing Technology": {
            "Teknologi Cetak": "On Demand Inkjet (Piezoelectric)",
            "Resolusi Maksimum": "5,760 x 1,440 dpi (with Variable-Sized Droplet Technology)",
            "Pencetakan Otomatis 2 Sisi": "No",
        },
        "Print Speed": {
            "Draf, A4 (Hitam / Warna)": "Approx. 33 ppm / 15 ppm",
            "ISO 24734, A4 Simpleks (Hitam / Warna)": "Hingga 10 ipm / 5,0 ipm",
        },
        "Copying": {
            "Resolusi Salin Maksimum": "600 x 600 dpi",
            "ISO 29183, A4, Simpleks (Hitam / Warna)": "Up to 7.0 ipm / 1.7 ipm",
        },
        "Scan Function": {
            "Resolusi Optik": "600 x 1,200 dpi",
            "Kecepatan Pindai (Flatbed 200 dpi)": "Monochrome: 11 sec / Colour: 32 sec",
        },
        "Interface": {"USB": "USB 2.0 Hi-speed"},
        "Consumables - Updated": {
            "Ink Model": "003 (CMYK) — TKDN: Bk 25,65% · C 25,25% · M 25,72% · Y 25,54% (Sertifikat 4000, 4004–4006/SJ-IND.8/TKDN/LVI/05/2026)",
            "Garansi": "2 years or 30,000 pages (+1 year with MyEpson Portal)",
            "Nomor Sertifikat TKDN": "6109/SJ-IND.8/E-TKDN/5/2025",
            "Total Nilai TKDN + BMP": "66,45% (TKDN 52,80% + BMP 13,65%)",
        },
    },
    "L3251": {
        "Printer Type": {"Tipe Printer": "Print, Scan, Copy"},
        "Printing Technology": {
            "Teknologi Cetak": "On Demand Inkjet (Piezoelectric)",
            "Resolusi Maksimum": "5,760 x 1,440 dpi (with Variable-Sized Droplet Technology)",
            "Pencetakan Otomatis 2 Sisi": "No",
        },
        "Print Speed": {
            "Draf, A4 (Hitam / Warna)": "Approx. 33 ppm / 15 ppm",
            "ISO 24734, A4 Simpleks (Hitam / Warna)": "Hingga 10 ipm / 5,0 ipm",
        },
        "Copying": {
            "Resolusi Salin Maksimum": "600 x 600 dpi",
            "ISO 29183, A4, Simpleks (Hitam / Warna)": "Up to 7.7 ipm / 3.8 ipm",
        },
        "Scan Function": {
            "Resolusi Optik": "1,200 x 2,400 dpi",
            "Kecepatan Pindai (Flatbed 200 dpi)": "Monochrome: 11 sec / Colour: 28 sec",
        },
        "Interface": {
            "USB": "USB 2.0",
            "Jaringan": "Wi-Fi, Wi-Fi Direct",
        },
        "Mobile and Cloud Solutions": {
            "Fitur Epson Connect": "Epson iPrint, Epson Email Print, Remote Print Driver, Epson Smart Panel",
        },
        "Consumables - Updated": {
            "Ink Model": "003 (CMYK) — TKDN: Bk 25,65% · C 25,25% · M 25,72% · Y 25,54% (Sertifikat 4000, 4004–4006/SJ-IND.8/TKDN/LVI/05/2026)",
            "Garansi": "2 years or 30,000 pages (+1 year with MyEpson Portal)",
            "Nomor Sertifikat TKDN": "6109/SJ-IND.8/E-TKDN/5/2025",
            "Total Nilai TKDN + BMP": "75,28% (TKDN 61,63% + BMP 13,65%)",
        },
    },
}
# Variants without specs on the site inherit specs from their base model.
INHERIT = {"L3211": "L3210", "L3251": "L3250"}


def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()


def model_of(name):
    return name.replace("Epson EcoTank", "").replace("Epson WorkForce", "").strip()


def find(specs, *pats):
    for kv in specs.values():
        for k, v in kv.items():
            if any(re.search(p, k, re.I) for p in pats):
                return v
    return ""


def yes(v):
    return bool(re.match(r"\s*(yes|ya)\b", v or "", re.I))


def main():
    data = json.load(open(sys.argv[1], encoding="utf-8"))
    images = {}
    for f in sys.argv[2:]:
        h = open(f, encoding="utf-8").read()
        for m in re.finditer(r"data-sku='([^']+)' data-element_type='img'>\s*<img class=\"lazyOwl\" src=\"([^\"]+)\"", h):
            images[m.group(1)] = html.unescape(m.group(2))

    IMG.mkdir(parents=True, exist_ok=True)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    by_model = {model_of(p["name"]): p for p in data}
    out = []
    for p in data:
        model = model_of(p["name"])
        if model not in CURATED:
            continue
        base_specs = p["specs"] or by_model.get(INHERIT.get(model, ""), {}).get("specs", {})
        specs = {**base_specs, **TKDN_SPECS.get(model, {})} if model in TKDN_SPECS else base_specs
        cat, tagline, ink = CURATED[model]
        cats = set(specs)
        ptype = find(specs, r"Tipe Printer").lower()
        funcs = ["Print"]
        if "Scan Function" in cats or re.search(r"scan|pindai", ptype): funcs.append("Scan")
        if "Copying" in cats or re.search(r"copy|salin", ptype): funcs.append("Copy")
        if "Fax Function" in cats or re.search(r"fax|faks", ptype): funcs.append("Fax")
        if model in ("L3556",): funcs = ["Print", "Scan", "Copy"]  # site mislabels type
        net = find(specs, r"^Jaringan")
        paper_max = find(specs, r"Ukuran Kertas Maksimum")
        width = re.search(r"(\d{3})[.,]?\d*\s*x", paper_max)
        fmt = "A3+" if width and int(width.group(1)) >= 320 else ("A3+" if "12.95" in paper_max else "A4")
        if model == "WF-100": fmt = "A4"
        img_file = ""
        if p["sku"] in images:
            img_file = f"assets/img/{p['sku']}.jpg"
            dest = ROOT / img_file
            if not dest.exists():
                try:
                    dest.write_bytes(get(images[p["sku"]]))
                except Exception as e:  # keep going; UI has a fallback
                    print("img fail", model, e); img_file = ""
        # strip noisy/irrelevant categories for display
        clean_specs = {}
        if model in TKDN:
            tk_code, tk_val, tk_bmp, tk_tot, tk_cert = TKDN[model]
            clean_specs["Sertifikasi TKDN Kemenperin RI"] = {
                "Nomor Sertifikat TKDN": tk_cert,
                "Kode Produk TKDN": tk_code,
                "Nilai TKDN": tk_val,
                "Nilai BMP": tk_bmp,
                "Total Nilai TKDN + BMP": tk_tot,
            }
        for c, kv in specs.items():
            if c.startswith("_"): continue
            if model in ("L6460", "L6490") and "Consumables" in c:
                kv = {k: re.sub(r"C13T03Y([1-4])00", r"008 (C13T06G\g<1>00)", v) for k, v in kv.items()}
            if model in ("M15140", "M15180") and "Consumables" in c:
                kv = {k: re.sub(r"008\b[^,]*", "005", v) for k, v in kv.items()}
            clean_specs[c] = kv
        out.append({
            "model": model,
            "name": p["name"].strip(),
            "sku": p["sku"],
            "url": p["url"],
            "image": img_file,
            "category": cat,
            "tagline": tagline,
            "ink": ink,
            "isNew": model in NEW_2026,
            "tkdn": model in TKDN,
            "tkdnScore": TKDN[model][3] if model in TKDN else "",
            "tkdnCert": TKDN[model][4] if model in TKDN else "",
            "color": cat != "mono",
            "format": fmt,
            "functions": funcs,
            "wifi": "wi-fi" in net.lower() or "wifi" in net.lower(),
            "ethernet": "ethernet" in net.lower(),
            "duplex": yes(find(specs, r"2 Sisi")),
            "adf": "ADF" in find(specs, r"Tipe Printer") or any("ADF" in k for kv in specs.values() for k in kv),
            "resolution": find(specs, r"Resolusi (Cetak )?Maksimum").split("(")[0].strip(),
            "speedIso": find(specs, r"ISO 24734"),
            "speedDraft": find(specs, r"^Draf"),
            "lcd": find(specs, r"LCD"),
            "dimensions": find(specs, r"Dimensi"),
            "weight": find(specs, r"^Berat"),
            "inherited": model in INHERIT and model not in TKDN_SPECS,
            "specs": clean_specs,
        })
    order = ["print", "aio", "office", "a3", "photo", "mono", "portable"]
    out.sort(key=lambda r: (order.index(r["category"]), [int(x) if x.isdigit() else x for x in re.split(r"(\d+)", r["model"])]))
    OUT.write_text("// Generated by scripts/build_data.py — data source: epson.co.id\nwindow.PRODUCTS = "
                   + json.dumps(out, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    print(len(out), "products,", sum(1 for r in out if r["image"]), "images")


if __name__ == "__main__":
    main()
