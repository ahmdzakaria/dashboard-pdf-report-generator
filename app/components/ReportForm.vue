<script setup lang="ts">
import { ref, reactive } from "vue";
import {
  formatRupiahFromDigits,
  rupiahTextToNumber,
} from "~/composables/useCurrency";

type PageSize = "A4" | "A5" | "Letter";

const emit = defineEmits<{
  (
    e: "submit",
    payload: {
      pageSize: PageSize;
      title: string;
      description: string;
      nominal: number;
    },
  ): void;
}>();

// default value A4
const pageSize = ref<PageSize>("A4");

const title = ref("");
const description = ref("");
const nominalText = ref("");

const loading = ref(false);

const errors = reactive({
  pageSize: "",
  title: "",
  description: "",
  nominal: "",
});

function clearErrors() {
  errors.pageSize = "";
  errors.title = "";
  errors.description = "";
  errors.nominal = "";
}

function validate() {
  clearErrors();
  let ok = true;

  // 2.1 required
  if (!pageSize.value) {
    errors.pageSize = "Ukuran halaman wajib dipilih";
    ok = false;
  }

  // 2.2 required, min 5, max 100
  const t = title.value.trim();
  if (!t) {
    errors.title = "Judul wajib diisi";
    ok = false;
  } else if (t.length < 5) {
    errors.title = "Judul minimal 5 karakter";
    ok = false;
  } else if (t.length > 100) {
    errors.title = "Judul maksimal 100 karakter";
    ok = false;
  }

  // 2.3 required, min 10
  const d = description.value.trim();
  if (!d) {
    errors.description = "Deskripsi wajib diisi";
    ok = false;
  } else if (d.length < 10) {
    errors.description = "Deskripsi minimal 10 karakter";
    ok = false;
  }

  // 2.4 required, only number, min 0
  if (nominalText.value.trim() === "") {
    errors.nominal = "Nominal wajib diisi";
    ok = false;
  } else {
    const n = rupiahTextToNumber(nominalText.value);
    if (Number.isNaN(n) || n < 0) {
      errors.nominal = "Nominal tidak valid";
      ok = false;
    }
  }

  return ok;
}

function onNominalInput(e: Event) {
  const v = (e.target as HTMLInputElement).value;
  // only digits
  const digits = v.replace(/\D/g, "");
  // show formatted with thousand separators (.)
  nominalText.value = formatRupiahFromDigits(digits);
}

async function onSubmit() {
  if (!validate()) return;

  loading.value = true;
  try {
    // submit as number (no format)
    const payload = {
      pageSize: pageSize.value,
      title: title.value.trim(),
      description: description.value.trim(),
      nominal: rupiahTextToNumber(nominalText.value),
    };
    emit("submit", payload);
  } finally {
    setTimeout(() => (loading.value = false), 250);
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <!-- Page Size + Title (side by side) -->
    <div class="grid gap-4 sm:grid-cols-2">
      <!-- 2.1 Dropdown -->
      <div class="space-y-1">
        <label class="text-sm font-medium">Ukuran Halaman</label>
        <select
          v-model="pageSize"
          class="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
          :class="
            errors.pageSize
              ? 'border-red-500 focus:ring-red-200'
              : 'border-gray-200 focus:ring-gray-200'
          "
        >
          <option value="A4">A4</option>
          <option value="A5">A5</option>
          <option value="Letter">Letter</option>
        </select>
        <p v-if="errors.pageSize" class="text-xs text-red-600">
          {{ errors.pageSize }}
        </p>
      </div>

      <!-- 2.2 Text Input -->
      <div class="space-y-1">
        <label class="text-sm font-medium">Judul Laporan</label>
        <input
          v-model="title"
          type="text"
          maxlength="100"
          placeholder="Masukkan judul laporan..."
          class="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
          :class="
            errors.title
              ? 'border-red-500 focus:ring-red-200'
              : 'border-gray-200 focus:ring-gray-200'
          "
        />
        <div class="flex justify-between text-xs text-gray-500">
          <span v-if="errors.title" class="text-red-600">{{
            errors.title
          }}</span>
          <span v-else>Minimal 5 karakter</span>
          <span>{{ title.length }}/100</span>
        </div>
      </div>
    </div>

    <!-- 2.3 Textarea -->
    <div class="space-y-1">
      <label class="text-sm font-medium">Deskripsi / Isi Laporan</label>
      <textarea
        v-model="description"
        rows="4"
        placeholder="Masukkan isi laporan..."
        class="w-full resize-y rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2"
        :class="
          errors.description
            ? 'border-red-500 focus:ring-red-200'
            : 'border-gray-200 focus:ring-gray-200'
        "
      />
      <p v-if="errors.description" class="text-xs text-red-600">
        {{ errors.description }}
      </p>
      <p v-else class="text-xs text-gray-500">Minimal 10 karakter</p>
    </div>

    <!-- 2.4 Currency -->
    <div class="space-y-1">
      <label class="text-sm font-medium">Nominal (Rp)</label>
      <div
        class="flex items-center gap-2 rounded-xl border bg-white px-3 py-2.5 focus-within:ring-2"
        :class="
          errors.nominal
            ? 'border-red-500 focus-within:ring-red-200'
            : 'border-gray-200 focus-within:ring-gray-200'
        "
      >
        <span class="text-sm text-gray-500">Rp</span>
        <input
          :value="nominalText"
          @input="onNominalInput"
          inputmode="numeric"
          autocomplete="off"
          placeholder="0"
          class="w-full text-sm outline-none"
        />
      </div>
      <p v-if="errors.nominal" class="text-xs text-red-600">
        {{ errors.nominal }}
      </p>
      <p v-else class="text-xs text-gray-500">Contoh: Rp 1.000.000</p>
    </div>

    <!-- Submit -->
    <div class="flex justify-end pt-2">
      <button
        type="submit"
        class="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="loading"
      >
        <span
          v-if="loading"
          class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
        />
        Generate PDF
      </button>
    </div>
  </form>
</template>
