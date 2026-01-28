<script setup lang="ts">
import HeaderBar from "~/components/HeaderBar.vue";
import ReportForm from "~/components/ReportForm.vue";

function handleSubmit(payload: any) {
  // nanti Task 3: call API generate PDF
  // nanti Task 4: simpan history
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <HeaderBar />

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
          <ReportForm @submit="handleSubmit" />
        </div>
      </section>

      <!-- HISTORY SECTION -->
      <section class="rounded-2xl border bg-white shadow-sm">
        <div class="border-b px-5 py-4">
          <h2 class="font-semibold">History Generate</h2>
          <p class="mt-1 text-xs text-gray-500">
            Daftar parameter generate terbaru.
          </p>
        </div>

        <div class="px-5 py-6">
          <div
            class="rounded-xl border border-dashed bg-gray-50 p-8 text-center"
          >
            <p class="text-sm font-medium text-gray-700">Belum ada data</p>
            <p class="mt-1 text-xs text-gray-500">
              Setelah generate PDF, history akan muncul di sini.
            </p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
