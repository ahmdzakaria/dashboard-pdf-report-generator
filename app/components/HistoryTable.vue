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

  // revoke belakangan biar tab baru aman
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
</script>

<template>
  <div
    v-if="props.items.length === 0"
    class="rounded-xl border border-dashed bg-gray-50 p-8 text-center"
  >
    <p class="text-sm font-medium text-gray-700">Belum ada data</p>
    <p class="mt-1 text-xs text-gray-500">
      Data akan muncul setelah berhasil generate PDF.
    </p>
  </div>

  <div v-else class="overflow-x-auto rounded-xl border">
    <table class="min-w-[980px] w-full text-sm">
      <thead class="bg-gray-100">
        <tr class="text-left">
          <th class="px-4 py-3 font-semibold">No</th>
          <th class="px-4 py-3 font-semibold">Judul</th>
          <th class="px-4 py-3 font-semibold">Page Size</th>
          <th class="px-4 py-3 font-semibold">Nominal</th>
          <th class="px-4 py-3 font-semibold">Tanggal</th>
          <th class="px-4 py-3 font-semibold">Aksi</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(item, idx) in props.items"
          :key="item.id"
          class="border-t odd:bg-white even:bg-gray-50"
        >
          <td class="px-4 py-3">{{ idx + 1 }}</td>
          <td class="px-4 py-3">
            <div class="max-w-[420px] truncate font-medium text-gray-800">
              {{ item.title }}
            </div>
          </td>
          <td class="px-4 py-3">{{ item.pageSize }}</td>
          <td class="px-4 py-3">{{ formatRupiah(item.nominal) }}</td>
          <td class="px-4 py-3">{{ formatDateTime(item.createdAt) }}</td>
          <td class="px-4 py-3">
            <button
              class="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-100"
              @click="viewPdf(item)"
            >
              Lihat PDF
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
