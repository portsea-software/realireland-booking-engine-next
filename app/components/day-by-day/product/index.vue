<template>
	<div class="d-flex col-12 col-md-4 mb-3">
		<div class="card mx-1">
			<img
				v-if="image"
				:src="image.url ?? undefined"
				:alt="image.caption || header"
				class="card-img-top img-responsive"
				style="height: 200px;"
			>

			<svg
				v-else
				class="card-img-top img-responsive"
				width="100%"
				height="200"
				xmlns="http://www.w3.org/2000/svg"
				preserveAspectRatio="xMidYMid slice"
				focusable="false"
				role="img"
				aria-label="Placeholder: Image unavailable"
			>
				<title>Placeholder</title>
				<rect
					width="100%"
					height="100%"
					fill="#868e96"
				/>
				<text
					x="50%"
					y="50%"
					fill="#dee2e6"
					dy="1em"
				>Image unavailable</text>
			</svg>

			<h5 class="card-header">
				{{ header }}
			</h5>
			<div class="card-body">
				<div class="row border-bottom">
					<div class="col">
						<h6 class="card-title">
							{{ location }}
						</h6>
					</div>

					<div class="col">
						<div class="row">
							<div class="col d-flex flex-row-reverse">
								<span
									v-if="iconKinds.length === 0 && String(product.rating || '') !== ''"
									class="badge badge-info mt-n2 pt-2 pb-1 px-2"
									:aria-label="String(product.rating || '')"
								>
									{{ product.rating }}
								</span>
								<Icon
									v-for="(k, index) in iconKinds"
									:key="index"
									:name="k === 'star' ? 'i-fa7-solid:star' : 'i-fa7-solid:euro-sign'"
									style="color: #FFD700;"
									:aria-label="String(product.rating || '')"
								/>
								<br>
							</div>
						</div>
					</div>
				</div>

				<p
					class="card-text mt-2"
					v-html="description"
				/>
			</div>

			<div class="card-footer">
				<div
					v-if="product.productCode === 'REST'"
					class="input-group justify-content-between align-items-center"
				>
					<Icon name="i-fa7-solid:clock" />
					<button
						v-for="restaurantTime in restaurantTimes"
						:key="restaurantTime"
						class="btn btn-sm btn-success"
						@click="addButtonClicked(product.productId, restaurantTime)"
					>
						{{ restaurantTime }}
					</button>
				</div>

				<div
					v-else
					class="input-group justify-content-end"
				>
					<button
						class="btn btn-success right"
						@click="addButtonClicked(product.productId)"
					>
						Add {{ productType }}
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { Product, ProductImage } from "~~/shared/types";

const starRegex = /^\d\sStar/g;

const props = defineProps<{
	product: Product;
	productType: string;
}>();

const dayByDay = useDayByDayStore();
const restaurantTimes = computed(() => dayByDay.restaurantTimes);

const header = computed(() => String(props.product.title ?? ""));
const description = computed(() => String(props.product.description ?? ""));

const location = computed(() => {
	const fc = props.product.fromCity as any;
	return String(fc?.name ?? fc ?? "");
});

const image = computed<ProductImage | null>(() => {
	const first = props.product.images?.[0];
	if (first?.url) return first;
	return null;
});

const iconKinds = computed<Array<"star" | "euro">>(() => {
	const code = String(props.product.productCode ?? "");
	const rating = String(props.product.rating ?? "");

	if (code === "HTL" && starRegex.test(rating)) {
		const n = Number.parseInt(rating.substring(0, 1), 10);
		return Array.from({ length: Number.isFinite(n) ? n : 0 }, () => "star");
	}

	if (code === "EXCR" || code === "TRA") {
		const repeats
			= rating === "Premium"
				? 3
				: rating === "Standard"
					? 2
					: rating === "Economy"
						? 1
						: 0;

		return Array.from({ length: repeats }, () => "euro");
	}

	return [];
});

const bookingBus = useBookingBusStore();
function addButtonClicked(productId: number, productTime?: string) {
	console.log(productId, productTime);
	bookingBus.requestAddProduct(productId, productTime);
}
</script>
