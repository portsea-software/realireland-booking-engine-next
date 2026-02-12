<template>
	<div
		id="product-dialog"
		ref="modalEl"
		class="modal fade"
		tabindex="-1"
		aria-hidden="true"
	>
		<div class="modal-dialog modal-xl modal-dialog-scrollable">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title font-weight-bold">
						{{ title }}
					</h5>

					<button
						type="button"
						class="btn-close"
						aria-label="Close"
						@click="hide()"
					/>
				</div>

				<div class="modal-body">
					<div class="row">
						<day-by-day-product
							v-for="p in products"
							:key="p.productId"
							:product="p"
							:product-type="productType"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Modal } from "bootstrap";
import type { Product } from "~~/shared/types";

const props = defineProps<{
	productType: string;
	products: Product[];
}>();

const title = computed(() => `Select ${props.productType}`);

const modalEl = ref<HTMLElement | null>(null);
let modal: Modal | null = null;

function show() {
	modal?.show();
}
function hide() {
	modal?.hide();
}

defineExpose({ show, hide });

onMounted(() => {
	if (!modalEl.value) return;
	modal = new Modal(modalEl.value, { backdrop: true, keyboard: true, focus: true });
});

onBeforeUnmount(() => {
	modal?.dispose();
	modal = null;
});
</script>
