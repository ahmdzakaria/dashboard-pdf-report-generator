<script setup lang="ts">
import HeaderBar from "~/components/HeaderBar.vue";
import ReportForm from "~/components/ReportForm.vue";

type SubmitPayload = {
  pageSize: string;
  title: string;
  description: string;
  nominal: number;
};

const isGenerating = ref(false);
const formKey = ref(0);
const toast = ref<{ type: "success" | "error"; message: string } | null>(null);

function showToast(type: "success" | "error", message: string) {
  toast.value = { type, message };
  window.setTimeout(() => (toast.value = null), 2500);
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

    const blob = new Blob([arrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const safeTitle = (payload.title || "report")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase();

    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${safeTitle}-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);

    showToast("success", "PDF berhasil di-generate");

    // Reset form (opsional)
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

      <!-- Task 4 nanti -->
      <section class="rounded-2xl border bg-white shadow-sm">
        <div class="border-b px-5 py-4">
          <h2 class="font-semibold">History Generate</h2>
        </div>
        <div class="px-5 py-6">
          <div
            class="rounded-xl border border-dashed bg-gray-50 p-8 text-center"
          >
            <p class="text-sm font-medium text-gray-700">Belum ada data</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
