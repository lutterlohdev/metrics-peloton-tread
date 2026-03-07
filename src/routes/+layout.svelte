<script>
	import '../app.css';
	import { onMount } from 'svelte';

	onMount(async () => {
		if ('serviceWorker' in navigator) {
			const { registerSW } = await import('virtual:pwa-register');
			registerSW({ immediate: true });
		}
	});

	let { children } = $props();
</script>

<div class="container">
	{@render children()}
</div>
