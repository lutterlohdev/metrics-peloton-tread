<script>
	import { page } from '$app/stores';
</script>

<div class="error-container">
	<div class="glass-panel error-card">
		<div class="error-icon">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="64"
				height="64"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path
					d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
				/>
				<line x1="12" y1="9" x2="12" y2="13" />
				<line x1="12" y1="17" x2="12.01" y2="17" />
			</svg>
		</div>
		<h1>{$page.status}</h1>
		<h2>Oops! Page {$page.status === 404 ? 'Not Found' : 'Error'}</h2>
		<p class="error-message">
			{$page.error?.message ||
				"We couldn't find the page you're looking for. It might have been removed, had its name changed, or is temporarily unavailable."}
		</p>
		<a href="/" class="home-btn">Return to Dashboard</a>
	</div>
</div>

<style>
	.error-container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: calc(100vh - 4rem); /* account for container padding */
		padding: 2rem 1rem;
	}

	.error-card {
		max-width: 500px;
		width: 100%;
		padding: 3rem 2rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}

	.error-icon {
		color: var(--accent-danger);
		margin-bottom: -0.5rem;
		animation: pulse 2s infinite ease-in-out;
	}

	h1 {
		font-size: 5rem;
		margin: 0;
		line-height: 1;
		background: linear-gradient(135deg, var(--accent-hover), var(--accent-primary));
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	h2 {
		font-size: 1.5rem;
		margin: 0;
		color: var(--text-primary);
	}

	.error-message {
		color: var(--text-secondary);
		font-size: 1.05rem;
		line-height: 1.6;
		margin-bottom: 1rem;
	}

	.home-btn {
		display: inline-block;
		background: var(--accent-primary);
		color: #ffffff;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-weight: 500;
		transition: all 0.2s ease;
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
	}

	.home-btn:hover {
		background: var(--accent-hover);
		color: #ffffff;
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(59, 130, 246, 0.35);
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.05);
			opacity: 0.8;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}
</style>
