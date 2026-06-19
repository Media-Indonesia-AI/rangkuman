"use client";

import { useState } from "react";
import { HomeTabs } from "./HomeTabs";
import { DateDivider } from "@/components/DateDivider";
import { StockCard } from "@/components/StockCard";
import { EmptyState } from "@/components/EmptyState";
import { getRecapsByDate, getRecapsByRecentDays, TODAY_ISO, YESTERDAY_ISO } from "@/lib/mock/recaps";
import { formatTanggalIndonesia } from "@/lib/util/formatDate";
import type { DateTabValue } from "@/components/DateTabs";

export function HomeFeed() {
  const [tab, setTab] = useState<DateTabValue>("today");

  const view =
    tab === "today"
      ? [{ isoDate: TODAY_ISO, items: getRecapsByDate(TODAY_ISO) }]
      : tab === "yesterday"
        ? [{ isoDate: YESTERDAY_ISO, items: getRecapsByDate(YESTERDAY_ISO) }]
        : Object.entries(getRecapsByRecentDays(7))
            .map(([isoDate, items]) => ({ isoDate, items }))
            .filter((d) => d.items.length > 0)
            .sort((a, b) => b.isoDate.localeCompare(a.isoDate));

  return (
    <>
      <div className="mb-6">
        <HomeTabs value={tab} onChange={setTab} />
      </div>

      {view.every((d) => d.items.length === 0) ? (
        <EmptyState
          title="Belum ada recap untuk tanggal ini"
          description="Coba pilih rentang waktu yang lebih luas."
          suggestion="Tab '7 Hari Terakhir' menampilkan recap dari minggu ini."
        />
      ) : (
        <div className="space-y-2">
          {view.map((day) => (
            <section key={day.isoDate}>
              {tab === "week" && <DateDivider isoDate={day.isoDate} />}
              {day.items.length === 0 ? (
                <EmptyState
                  title="Belum ada recap"
                  description={`Tidak ada saham yang diberitakan pada ${formatTanggalIndonesia(day.isoDate)}.`}
                />
              ) : (
                <div className="space-y-4">
                  {day.items.map((recap) => (
                    <StockCard key={recap.id} recap={recap} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </>
  );
}
