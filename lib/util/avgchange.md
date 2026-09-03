# `avgChange`

Persen perubahan harian sebuah sector, diturunkan dari dua sumber
data yang berbeda. Backend tidak mengirim field ini secara
langsung.

## Live — `lib/util/sectorMappers.ts`

Dari index sector (`last`, `prev`):

```
avgChange = ((last - prev) / prev) × 100
```

Guard `prev !== 0` mengembalikan `0` saat index belum tersedia.

Dipakai oleh `<SektorCard />` dan `<SektorDetailHeader />`.

## Mock — `lib/mock/sectors.ts`

Index sector tidak tersedia di katalog, jadi didekati dari
rata-rata aritmatika `changePercent` emiten konstituen
(**unweighted** — kapitalisasi pasar diabaikan):

```
avgChange = (Σ changePercent_i) / N
```

Dipakai oleh `app/sektor/[slug]/page.tsx` untuk SEO metadata saja.

## Catatan

- Untuk hari yang sama, kedua jalur bergerak searah tapi nilai
  absolutnya bisa berbeda — jalur mock memberi bobot yang sama
  ke setiap emiten.
- Bukan rekomendasi investasi.
