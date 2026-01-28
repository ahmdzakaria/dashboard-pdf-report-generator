<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import {
  formatRupiahFromDigits,
  rupiahTextToNumber,
} from "~/composables/useCurrency";

type SubmitPayload = {
  pageSize: string;
  title: string;
  description: string;
  nominal: number;
};

const props = defineProps<{ loading?: boolean }>();
const emit = defineEmits<{ (e: "submit", payload: SubmitPayload): void }>();

const pageSizeOptions = ["A4", "A5", "Letter"];

const pageSize = ref("A4");
const title = ref("");
const description = ref("");
const nominalText = ref("");

const titleCount = computed(() => title.value.length);

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

  if (!pageSize.value) {
    errors.pageSize = "Ukuran halaman wajib dipilih";
    ok = false;
  }

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

  const d = description.value.trim();
  if (!d) {
    errors.description = "Deskripsi wajib diisi";
    ok = false;
  } else if (d.length < 10) {
    errors.description = "Deskripsi minimal 10 karakter";
    ok = false;
  }

  const nominalNum = rupiahTextToNumber(nominalText.value);
  if (nominalText.value.trim() === "") {
    errors.nominal = "Nominal wajib diisi";
    ok = false;
  } else if (!Number.isFinite(nominalNum) || nominalNum < 0) {
    errors.nominal = "Nominal tidak valid (minimal Rp 0)";
    ok = false;
  }

  return ok;
}

function onNominalInput(e: Event) {
  const el = e.target as HTMLInputElement;
  nominalText.value = formatRupiahFromDigits(el.value);
  if (errors.nominal) errors.nominal = "";
}

function onSubmit() {
  // prevent double submit when loading
  if (props.loading) return;

  // ✅ Task 3: validasi dulu
  if (!validate()) return;

  emit("submit", {
    pageSize: pageSize.value,
    title: title.value.trim(),
    description: description.value.trim(),
    nominal: rupiahTextToNumber(nominalText.value),
  });
}
</script>

<template>
  <!-- ✅ penting: form + submit.prevent -->
  <form class="space-y-5" @submit.prevent="onSubmit">
    <div class="grid gap-4 md:grid-cols-2">
      <!-- Page Size -->
      <div>
        <label class="block text-sm font-medium text-gray-800"
          >Ukuran Halaman</label
        >
        <select
          v-model="pageSize"
          class="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          :class="errors.pageSize ? 'border-red-400' : 'border-gray-200'"
          :disabled="props.loading"
          @change="errors.pageSize = ''"
        >
          <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
        <p v-if="errors.pageSize" class="mt-1 text-xs text-red-600">
          {{ errors.pageSize }}
        </p>
      </div>

      <!-- Title -->
      <div>
        <label class="block text-sm font-medium text-gray-800"
          >Judul Laporan</label
        >
        <input
          v-model="title"
          type="text"
          maxlength="100"
          placeholder="Masukkan judul laporan..."
          class="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          :class="errors.title ? 'border-red-400' : 'border-gray-200'"
          :disabled="props.loading"
          @input="errors.title = ''"
        />
        <div class="mt-1 flex items-center justify-between">
          <p class="text-xs text-gray-500">Minimal 5 karakter</p>
          <p class="text-xs text-gray-500">{{ titleCount }}/100</p>
        </div>
        <p v-if="errors.title" class="mt-1 text-xs text-red-600">
          {{ errors.title }}
        </p>
      </div>
    </div>

    <!-- Description -->
    <div>
      <label class="block text-sm font-medium text-gray-800"
        >Deskripsi / Isi Laporan</label
      >
      <textarea
        v-model="description"
        rows="4"
        placeholder="Masukkan isi laporan..."
        class="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
        :class="errors.description ? 'border-red-400' : 'border-gray-200'"
        :disabled="props.loading"
        @input="errors.description = ''"
      />
      <p v-if="errors.description" class="mt-1 text-xs text-red-600">
        {{ errors.description }}
      </p>
    </div>

    <!-- Nominal -->
    <div>
      <label class="block text-sm font-medium text-gray-800"
        >Nominal (Rp)</label
      >
      <input
        :value="nominalText"
        inputmode="numeric"
        autocomplete="off"
        placeholder="Rp 0"
        class="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
        :class="errors.nominal ? 'border-red-400' : 'border-gray-200'"
        :disabled="props.loading"
        @input="onNominalInput"
      />
      <p v-if="errors.nominal" class="mt-1 text-xs text-red-600">
        {{ errors.nominal }}
      </p>
    </div>

    <!-- Button -->
    <div class="flex justify-end pt-2">
      <button
        type="submit"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="props.loading"
      >
        <span
          v-if="props.loading"
          class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
        />
        <span v-else class="text-base">📄</span>
        <span>{{ props.loading ? "Generating..." : "Generate PDF" }}</span>
      </button>
    </div>
  </form>
</template>
