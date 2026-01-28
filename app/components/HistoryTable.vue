<script setup lang="ts">
import type { HistoryItem } from "~/composables/useHistory";
import {
  formatRupiah,
  formatDateTime,
  base64ToBlob,
} from "~/composables/useHistory";

const props = defineProps<{ items: HistoryItem[] }>();

function viewPdf(item: HistoryItem) {
  const blob = base64ToBlob(item.pdfBase64, "application/pdf");
  const url = URL.createObjectURL(blob);

  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function badgeClass(size: string) {
  const s = String(size || "").toUpperCase();
  if (s === "A5") return "bg-indigo-50 text-indigo-700 ring-indigo-200";
  if (s === "LETTER") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
}
</script>

<template>
  <!-- Empty state -->
  <div
    v-if="props.items.length === 0"
    class="rounded-2xl border border-dashed bg-slate-50 p-10 text-center"
  >
    <p class="text-sm font-semibold text-slate-800">Belum ada data</p>
    <p class="mt-1 text-sm text-slate-500">
      Data akan muncul setelah kamu berhasil generate PDF.
    </p>

    <div
      class="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs text-slate-600 ring-1 ring-slate-200"
    >
      <span class="inline-block h-2 w-2 rounded-full bg-slate-400" />
      Tips: coba buat laporan pertama dengan judul jelas + deskripsi paragraf.
    </div>
  </div>

  <!-- Table -->
  <div v-else class="overflow-x-auto rounded-2xl border bg-white">
    <table class="min-w-[980px] w-full text-sm">
      <thead class="bg-slate-50 text-slate-600">
        <tr class="text-left">
          <th class="px-4 py-3 font-semibold">No</th>
          <th class="px-4 py-3 font-semibold">Judul</th>
          <th class="px-4 py-3 font-semibold">Page Size</th>
          <th class="px-4 py-3 font-semibold text-right">Nominal</th>
          <th class="px-4 py-3 font-semibold">Tanggal</th>
          <th class="px-4 py-3 font-semibold">Aksi</th>
        </tr>
      </thead>

      <tbody class="divide-y">
        <tr
          v-for="(item, idx) in props.items"
          :key="item.id"
          class="hover:bg-slate-50 transition-colors"
        >
          <td class="px-4 py-3 text-slate-600">{{ idx + 1 }}</td>

          <td class="px-4 py-3">
            <div class="max-w-[420px] truncate font-semibold text-slate-900">
              {{ item.title }}
            </div>
            <div class="mt-0.5 text-xs text-slate-500 truncate max-w-[420px]">
              {{ item.fileName }}
            </div>
          </td>

          <td class="px-4 py-3">
            <span
              class="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ring-1"
              :class="badgeClass(item.pageSize)"
            >
              {{ item.pageSize }}
            </span>
          </td>

          <td
            class="px-4 py-3 text-right tabular-nums font-medium text-slate-900"
          >
            {{ formatRupiah(item.nominal) }}
          </td>

          <td class="px-4 py-3 text-slate-600">
            {{ formatDateTime(item.createdAt) }}
          </td>

          <td class="px-4 py-3">
            <button
              class="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              @click="viewPdf(item)"
            >
              <span
                class="inline-block h-2 w-2 rounded-full bg-slate-400"
              ></span>
              Lihat PDF
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
