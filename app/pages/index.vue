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

const isGenerating = ref(false);
const formKey = ref(0);
const toast = ref<{ type: "success" | "error"; message: string } | null>(null);

const history = ref<HistoryItem[]>([]);

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

    // ✅ Task 3: auto-download (boleh)
    downloadNow(arrayBuffer, fileName);

    // ✅ Task 4: simpan history setelah berhasil generate
    const newItem: HistoryItem = {
      id: makeId(),
      title: payload.title,
      pageSize: payload.pageSize,
      nominal: payload.nominal,
      createdAt: new Date().toISOString(),
      fileName,
      pdfBase64: arrayBufferToBase64(arrayBuffer),
    };

    // ✅ sort terbaru desc
    const next = [newItem, ...history.value].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    history.value = next;
    saveHistory(next);

    showToast("success", "PDF berhasil di-generate");

    // ✅ reset form optional
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
  <div class="min-h-screen bg-gray-50">
    <HeaderBar />

    <div v-if="toast" class="fixed right-4 top-4 z-50">
      <div
        class="rounded-xl border px-4 py-3 shadow-sm bg-white"
        :class="
          toast.type === 'success' ? 'border-green-200' : 'border-red-200'
        "
      >
        <p class="text-sm font-medium">{{ toast.message }}</p>
      </div>
    </div>

    <main class="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <!-- FORM SECTION -->
      <section class="rounded-2xl border bg-white shadow-sm">
        <div class="border-b px-5 py-4">
          <h2 class="font-semibold">Form Generate</h2>
          <p class="mt-1 text-xs text-gray-500">
            Isi parameter laporan untuk generate PDF.
          </p>
        </div>

        <div class="px-5 py-5">
          <ReportForm
            :key="formKey"
            :loading="isGenerating"
            @submit="handleSubmit"
          />
        </div>
      </section>

      <!-- TABLE SECTION -->
      <section class="rounded-2xl border bg-white shadow-sm">
        <div class="border-b px-5 py-4">
          <h2 class="font-semibold">History Generate</h2>
          <p class="mt-1 text-xs text-gray-500">
            Urut terbaru di atas. Responsif & persist saat refresh.
          </p>
        </div>

        <div class="px-5 py-6">
          <HistoryTable :items="history" />
        </div>
      </section>
    </main>
  </div>
</template>
