<script setup lang="ts">
import HeaderBar from "~/components/HeaderBar.vue";
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <HeaderBar />

    <!-- Content -->
    <main class="mx-auto max-w-6xl px-4 py-6">
      <!-- Responsive layout:
           Mobile: 1 column
           Desktop: 2 columns (Form left, Table right)
      -->
      <div class="grid gap-6 lg:grid-cols-5">
        <!-- FORM SECTION -->
        <section class="lg:col-span-2">
          <div class="rounded-2xl border bg-white shadow-sm">
            <div class="border-b px-5 py-4">
              <h2 class="font-semibold">Form Generate</h2>
              <p class="mt-1 text-xs text-gray-500">
                Isi parameter laporan untuk generate PDF.
              </p>
            </div>

            <!-- Placeholder area for Task 2 -->
            <div class="space-y-4 px-5 py-5">
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div class="space-y-2">
                  <div class="h-4 w-32 rounded bg-gray-100" />
                  <div class="h-11 w-full rounded-xl bg-gray-100" />
                </div>
                <div class="space-y-2">
                  <div class="h-4 w-32 rounded bg-gray-100" />
                  <div class="h-11 w-full rounded-xl bg-gray-100" />
                </div>
              </div>

              <div class="space-y-2">
                <div class="h-4 w-44 rounded bg-gray-100" />
                <div class="h-28 w-full rounded-xl bg-gray-100" />
              </div>

              <div class="space-y-2">
                <div class="h-4 w-28 rounded bg-gray-100" />
                <div class="h-11 w-full rounded-xl bg-gray-100" />
              </div>

              <div class="flex justify-end pt-1">
                <div class="h-11 w-40 rounded-xl bg-gray-900/90" />
              </div>
            </div>
          </div>
        </section>

        <!-- TABLE SECTION -->
        <section class="lg:col-span-3">
          <div class="rounded-2xl border bg-white shadow-sm">
            <div class="border-b px-5 py-4">
              <h2 class="font-semibold">History Generate</h2>
              <p class="mt-1 text-xs text-gray-500">
                Daftar parameter generate terbaru.
              </p>
            </div>

            <!-- Placeholder empty state for Task 4 -->
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
          </div>
        </section>
      </div>
    </main>
  </div>
</template>
