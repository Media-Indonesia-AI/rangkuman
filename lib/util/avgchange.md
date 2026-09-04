# `avgChange`

Persen perubahan harian sebuah sector, diturunkan dari index
sector (`last`, `prev`) yang dikirim oleh backend.

## Live — `lib/util/sectorMappers.ts`

```
avgChange = ((last - prev) / prev) × 100
```

Guard `prev !== 0` mengembalikan `0` saat index belum tersedia.

Dipakai oleh `<SektorCard />`, `<SektorDetailHeader />`, dan
`generateMetadata` di `app/sektor/[slug]/page.tsx`.

Bukan rekomendasi investasi.
