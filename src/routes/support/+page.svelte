<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	// State
	let language = 'KOR';
	let isUnityWebView = false;
	let uid = '';
	let locale = '';

	// Reactive statement to watch URL parameter changes
	$: if (browser && $page.url.searchParams) {
		uid = $page.url.searchParams.get('uid') || '';
		const urlLocale = $page.url.searchParams.get('locale') || '';

		// Unity에서 전달된 파라미터 확인
		if (uid && !isUnityWebView) {
			isUnityWebView = true;
			console.log('Unity WebView detected with UID:', uid);
		}

		// 언어 설정 (URL 파라미터가 있을 때만)
		if (urlLocale) {
			locale = urlLocale;
			if (urlLocale.startsWith('ko') || urlLocale.toLowerCase() === 'kor') {
				language = 'KOR';
			} else if (urlLocale.startsWith('en') || urlLocale.toLowerCase() === 'eng') {
				language = 'ENG';
			} else if (urlLocale.startsWith('ja') || urlLocale.toLowerCase() === 'jpn') {
				language = 'JPN';
			} else {
				language = 'ENG'; // fallback
			}
		}
	}

	// Update locale when language changes manually
	$: if (language) {
		if (language === 'KOR') {
			locale = 'kor';
		} else if (language === 'ENG') {
			locale = 'eng';
		} else if (language === 'JPN') {
			locale = 'jpn';
		}
	}

	// Navigate to inquiry page with parameters
	function goToInquiry() {
		const params = new URLSearchParams();
		if (uid) params.append('uid', uid);
		if (locale) params.append('locale', locale);

		const url = `/inquiry${params.toString() ? '?' + params.toString() : ''}`;
		goto(url);
	}

	// Navigate to redeem page with parameters
	function goToRedeem() {
		const params = new URLSearchParams();
		if (uid) params.append('uid', uid);
		if (locale) params.append('locale', locale);

		const url = `/redeem${params.toString() ? '?' + params.toString() : ''}`;
		goto(url);
	}

	// Translation data
	const translationsData = {
		KOR: {
			title: '고객센터',
			subtitle: '무엇을 도와드릴까요?',
			support_title: '1:1 문의',
			support_description: '게임 관련 문의사항을 남겨주세요',
			redeem_title: '쿠폰 입력',
			redeem_description: '쿠폰 코드를 입력하고 보상을 받으세요',
			go_button: '바로가기',
			language_name: '한국어'
		},
		ENG: {
			title: 'Customer Support',
			subtitle: 'How can we help you?',
			support_title: '1:1 Inquiry',
			support_description: 'Submit your game-related inquiries',
			redeem_title: 'Redeem Code',
			redeem_description: 'Enter coupon code and receive rewards',
			go_button: 'Go',
			language_name: 'English'
		},
		JPN: {
			title: 'カスタマーサポート',
			subtitle: 'どのようなご用件でしょうか？',
			support_title: '1:1 お問い合わせ',
			support_description: 'ゲーム関連のお問い合わせを送信してください',
			redeem_title: 'クーポン入力',
			redeem_description: 'クーポンコードを入力して報酬を受け取ります',
			go_button: '進む',
			language_name: '日本語'
		}
	};

	// Reactive current translations
	$: currentTranslations = translationsData[language] || translationsData['ENG'];

	// Get translated text
	$: t = (key) => {
		return currentTranslations?.[key] || key;
	};
</script>

<svelte:head>
	<title>{t('title')} - Pice Console</title>
</svelte:head>

<div class="page-container">
	<!-- Hero Section -->
	<div class="hero">
		<!-- Background Image -->
		<img src="/images/img_pc.jpg" class="hero-bg-image" alt="Background">

		<!-- Language Selector (absolute positioned, top-right) -->
		{#if !isUnityWebView}
			<div class="language-selector-wrapper">
				<select
					bind:value={language}
					class="language-selector"
				>
					<option value="KOR">한국어</option>
					<option value="ENG">English</option>
					<option value="JPN">日本語</option>
				</select>
			</div>
		{:else}
			<div class="language-indicator">
				<span class="status-dot"></span>
				<span>{t('language_name')}</span>
			</div>
		{/if}

		<!-- Logo -->
		<div class="hero-content">
			<img src="/images/img_logo.png" class="hero-logo" alt="Pop Up Pirate Dice">

			<!-- Title -->
			<h1 class="hero-title">{t('title')}</h1>
			<p class="hero-subtitle">{t('subtitle')}</p>
		</div>
	</div>

	<!-- Cards Container -->
	<div class="cards-container">
		<!-- Inquiry Card -->
		<button
			on:click={goToInquiry}
			class="card"
		>
			<div class="card-icon-wrapper card-icon-blue">
				<img src="/images/icon_neko.png" class="card-icon" alt="Inquiry">
			</div>
			<div class="card-content">
				<h2 class="card-title">{t('support_title')}</h2>
				<p class="card-description">{t('support_description')}</p>
				<div class="card-link">
					{t('go_button')}
					<svg class="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
					</svg>
				</div>
			</div>
		</button>

		<!-- Redeem Card -->
		<button
			on:click={goToRedeem}
			class="card"
		>
			<div class="card-icon-wrapper card-icon-green">
				<img src="/images/icon_coupon.png" class="card-icon" alt="Coupon">
			</div>
			<div class="card-content">
				<h2 class="card-title">{t('redeem_title')}</h2>
				<p class="card-description">{t('redeem_description')}</p>
				<div class="card-link">
					{t('go_button')}
					<svg class="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
					</svg>
				</div>
			</div>
		</button>
	</div>
</div>

<style>
	/* Page Container */
	.page-container {
		min-height: 100vh;
		background-color: #E8F4F8;
		position: relative;
		overflow-x: hidden;
	}

	/* Hero Section */
	.hero {
		width: 100%;
		min-height: 300px;
		position: relative;
		overflow: hidden;
		background: linear-gradient(180deg, #00BCD4 0%, #4DD0E1 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 40px 20px;
	}

	.hero-bg-image {
		position: absolute;
		top: 50%;
		left: 50%;
		height: 100%;
		width: auto;
		min-width: 100%;
		object-fit: cover;
		transform: translate(-50%, -50%);
		z-index: 1;
	}

	.hero-content {
		position: relative;
		z-index: 10;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}

	.hero-logo {
		height: 157px;
		width: auto;
		object-fit: contain;
	}

	/* Language Selector */
	.language-selector-wrapper {
		position: absolute;
		top: 20px;
		right: 20px;
		z-index: 20;
	}

	.language-selector {
		padding: 8px 32px 8px 16px;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.3);
		background: rgba(255, 255, 255, 0.95);
		color: #1f2937;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		appearance: none;
		background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"%3E%3Cpath stroke="%236b7280" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 8l4 4 4-4"/%3E%3C/svg%3E');
		background-repeat: no-repeat;
		background-position: right 8px center;
		background-size: 20px;
		transition: all 0.2s;
	}

	.language-selector:hover {
		background: white;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.language-selector:focus {
		outline: none;
		box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
	}

	.language-indicator {
		position: absolute;
		top: 20px;
		right: 20px;
		z-index: 20;
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.9);
		font-size: 12px;
		color: #4b5563;
	}

	.status-dot {
		width: 8px;
		height: 8px;
		background: #10b981;
		border-radius: 50%;
	}

	/* Hero Text */
	.hero-title {
		font-size: 32px;
		font-weight: 800;
		color: white;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		margin: 0;
	}

	.hero-subtitle {
		font-size: 18px;
		font-weight: 500;
		color: white;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		margin: 0;
		margin-top: -12px;
	}

	/* Cards Container */
	.cards-container {
		max-width: 600px;
		margin: 0 auto;
		padding: 24px 20px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	/* Card */
	.card {
		background: white;
		border-radius: 24px;
		padding: 28px 24px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
		border: none;
		cursor: pointer;
		text-align: left;
		transition: all 0.2s;
		width: 100%;
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		gap: 16px;
	}

	.card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
	}

	.card:active {
		transform: translateY(0);
	}

	.card-icon-wrapper {
		width: 80px;
		height: 80px;
		border-radius: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.card-icon-blue {
		background: #E3F2FD;
	}

	.card-icon-green {
		background: #E8F5E9;
	}

	.card-icon {
		width: 48px;
		height: 48px;
		object-fit: contain;
	}

	.card-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
	}

	.card-title {
		font-size: 22px;
		font-weight: 700;
		color: #1f2937;
		margin: 0;
	}

	.card-description {
		font-size: 14px;
		color: #6b7280;
		margin: 0;
		line-height: 1.5;
	}

	.card-link {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 4px;
		color: #3b82f6;
		font-size: 15px;
		font-weight: 600;
		transition: gap 0.2s;
		margin-top: 4px;
	}

	.card:hover .card-link {
		gap: 8px;
	}

	.arrow-icon {
		width: 14px;
		height: 14px;
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.hero {
			min-height: 250px;
			padding: 30px 16px;
		}

		.hero-bg-image {
			transform: translate(-50%, -50%);
		}

		.hero-logo {
			height: 120px;
		}

		.language-selector-wrapper {
			top: 12px;
			right: 12px;
		}

		.language-selector {
			padding: 6px 28px 6px 12px;
			font-size: 12px;
			background-size: 18px;
		}

		.language-indicator {
			top: 12px;
			right: 12px;
			padding: 4px 10px;
			font-size: 11px;
		}

		.status-dot {
			width: 6px;
			height: 6px;
		}

		.hero-title {
			font-size: 24px;
		}

		.hero-subtitle {
			font-size: 14px;
			margin-top: -10px;
		}

		.cards-container {
			padding: 20px 16px;
			gap: 12px;
		}

		.card {
			padding: 24px 20px;
			gap: 12px;
		}

		.card-icon-wrapper {
			width: 70px;
			height: 70px;
		}

		.card-icon {
			width: 42px;
			height: 42px;
		}

		.card-title {
			font-size: 20px;
		}

		.card-description {
			font-size: 13px;
		}

		.card-link {
			font-size: 14px;
		}
	}

	/* Very small screens */
	@media (max-width: 360px) {
		.hero {
			min-height: 200px;
			padding: 24px 12px;
		}

		.hero-logo {
			height: 90px;
		}

		.hero-title {
			font-size: 20px;
		}

		.hero-subtitle {
			font-size: 12px;
			margin-top: -8px;
		}

		.card {
			padding: 20px 16px;
			gap: 10px;
		}

		.card-icon-wrapper {
			width: 64px;
			height: 64px;
		}

		.card-icon {
			width: 38px;
			height: 38px;
		}

		.card-title {
			font-size: 18px;
		}

		.card-description {
			font-size: 12px;
		}
	}
</style>
