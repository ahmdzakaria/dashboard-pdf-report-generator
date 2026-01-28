<script setup lang="ts">
import HeaderBar from "~/components/HeaderBar.vue";
import ReportForm from "~/components/ReportForm.vue";
import HistoryTable from "~/components/HistoryTable.vue";

import {
  type HistoryItem,
  loadHistory,
  saveHistory,
  arrayBufferToBase64,
  makeId,
} from "~/composables/useHistory";

type SubmitPayload = {
  pageSize: string;
  title: string;
  description: string;
  nominal: number;
};

useHead({
  title: "PDF Report Generator - Dashboard",
  meta: [
    {
      name: "description",
      content: "Generate laporan PDF dan simpan riwayat.",
    },
  ],
});

const isGenerating = ref(false);
const formKey = ref(0);
const toast = ref<{ type: "success" | "error"; message: string } | null>(null);

const history = ref<HistoryItem[]>([]);
const search = ref("");

onMounted(() => {
  history.value = loadHistory();
});

function showToast(type: "success" | "error", message: string) {
  toast.value = { type, message };
  window.setTimeout(() => (toast.value = null), 2500);
}

function makeFileName(title: string) {
  const safeTitle = (title || "report")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
  return `report-${safeTitle}-${Date.now()}.pdf`;
}

function downloadNow(arrayBuffer: ArrayBuffer, fileName: string) {
  const blob = new Blob([arrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const filteredHistory = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return history.value;
  return history.value.filter((it) =>
    String(it.title || "")
      .toLowerCase()
      .includes(q),
  );
});

function clearHistory() {
  history.value = [];
  saveHistory([]);
  showToast("success", "History berhasil dibersihkan.");
}

async function handleSubmit(payload: SubmitPayload) {
  if (isGenerating.value) return;

  try {
    isGenerating.value = true;

    const arrayBuffer = await $fetch<ArrayBuffer>("/api/generate-pdf", {
      method: "POST",
      body: payload,
      responseType: "arrayBuffer" as any,
    });

    const fileName = makeFileName(payload.title);

    // auto-download
    downloadNow(arrayBuffer, fileName);

    // simpan history
    const newItem: HistoryItem = {
      id: makeId(),
      title: payload.title,
      pageSize: payload.pageSize,
      nominal: payload.nominal,
      createdAt: new Date().toISOString(),
      fileName,
      pdfBase64: arrayBufferToBase64(arrayBuffer),
    };

    const next = [newItem, ...history.value].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    history.value = next;
    saveHistory(next);

    showToast("success", "PDF berhasil di-generate & terunduh.");
    formKey.value++;
  } catch (err: any) {
    const msg =
      err?.data?.message ||
      err?.statusMessage ||
      err?.message ||
      "Gagal generate PDF. Coba lagi.";
    showToast("error", msg);
  } finally {
    isGenerating.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <HeaderBar />

    <!-- Toast -->
    <div v-if="toast" class="fixed right-4 top-4 z-50">
      <div
        class="rounded-2xl px-4 py-3 shadow-lg border text-sm font-medium text-slate-900 bg-white"
        :class="
          toast.type === 'success' ? 'border-emerald-200' : 'border-rose-200'
        "
      >
        <div class="flex items-start gap-2">
          <span
            class="mt-0.5 inline-flex h-2.5 w-2.5 rounded-full"
            :class="toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'"
          />
          <p>{{ toast.message }}</p>
        </div>
      </div>
    </div>

    <main class="mx-auto max-w-6xl px-4 py-7 space-y-6">
      <!-- FORM SECTION (full width) -->
      <section class="rounded-2xl border bg-white shadow-sm">
        <div class="border-b px-6 py-5">
          <h2 class="text-lg font-semibold text-slate-900">Form Generate</h2>
          <p class="mt-1 text-sm text-slate-500">
            Isi parameter laporan untuk generate PDF.
          </p>
        </div>

        <div class="px-6 py-6">
          <ReportForm
            :key="formKey"
            :loading="isGenerating"
            @submit="handleSubmit"
          />
        </div>
      </section>

      <!-- HISTORY SECTION -->
      <section class="rounded-2xl border bg-white shadow-sm">
        <div
          class="border-b px-6 py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 class="text-lg font-semibold text-slate-900">
              History Generate
            </h2>
            <p class="mt-1 text-sm text-slate-500">
              Urut terbaru di atas. Responsif & persist saat refresh.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <input
              v-model="search"
              type="text"
              placeholder="Cari judul..."
              class="h-10 w-full sm:w-64 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
            />
            <button
              type="button"
              class="h-10 rounded-xl border px-3 text-sm font-medium hover:bg-slate-50"
              @click="clearHistory"
            >
              Clear
            </button>
          </div>
        </div>

        <div class="px-6 py-6">
          <HistoryTable :items="filteredHistory" />
        </div>
      </section>
    </main>
  </div>
</template>
