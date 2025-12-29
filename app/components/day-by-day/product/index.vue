<template>
	<div class="d-flex col-12 col-md-4 mb-3">
		<div class="card mx-1">
			<!-- Image Cap -->
			<img
				v-if="image"
				:src="image.url"
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

			<!-- Header -->
			<h5 class="card-header">
				{{ header }}
			</h5>

			<!-- Card Body -->
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

								<!-- Replace old <b-icon> with FontAwesome (consistent with your other code) -->
								<!-- <font-awesome-icon
									v-for="(k, index) in iconKinds"
									:key="index"
									:icon="k === 'star' ? ['fas', 'star'] : ['fas', 'euro-sign']"
									style="color: #FFD700;"
									:aria-label="String(product.rating || '')"
								/> -->
								<br>
							</div>
						</div>
					</div>
				</div>

				<p class="card-text mt-2">
					{{ description }}
				</p>
			</div>

			<!-- Card Footer -->
			<div class="card-footer">
				<div
					v-if="product.productCode === 'REST'"
					class="input-group justify-content-between align-items-center"
				>
					<!-- <font-awesome-icon
						class="fa-lg"
						:icon="['fas', 'clock']"
						aria-label="Reservation time"
					/> -->

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
const starRegex = /^\d\sStar/g;

type ProductImage = { url: string; caption?: string; imageId?: number };
type Product = {
	productId: number;
	title?: string;
	description?: string;
	productCode?: string; // HTL / EXCR / TRA / REST / etc
	rating?: string;
	images?: ProductImage[];

	// in your migrated mapping, fromCity may be a string. In old it was object.
	fromCity?: any;
};

const props = defineProps<{
	product: Product;
	productType: string;
}>();

// Pinia option store (your dayByDay store)
const dayByDay = useDayByDayStore();
const restaurantTimes = computed(() => dayByDay.restaurantTimes);

// Mitt event bus (see composable below)
// const bus = useEventBus();

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

/**
 * Instead of pushing to data() in created(), compute it.
 * We return an array like ["star","star"] or ["euro","euro"].
 */
const iconKinds = computed<Array<"star" | "euro">>(() => {
	const code = String(props.product.productCode ?? "");
	const rating = String(props.product.rating ?? "");

	// HTL => stars if rating like "3 Star ..."
	if (code === "HTL" && starRegex.test(rating)) {
		const n = Number.parseInt(rating.substring(0, 1), 10);
		return Array.from({ length: Number.isFinite(n) ? n : 0 }, () => "star");
	}

	// EXCR/TRA => euros by tier
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

// function addButtonClicked(productId: number, productTime?: string) {
// 	// Mirror Vue2 behaviour: eventBus.addProduct(productId, productTime?)
// 	// bus.emit("addProduct", { productId, productTime });
// 	console.log(productId, productTime);
// }

const bookingBus = useBookingBusStore();
function addButtonClicked(productId: number, productTime?: string) {
	console.log(productId, productTime);
	bookingBus.requestAddProduct(productId, productTime);
}
</script>
