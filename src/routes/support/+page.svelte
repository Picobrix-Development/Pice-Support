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

<div class="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center">
	<div class="max-w-4xl mx-auto px-4 py-6 md:py-10 w-full">
		<!-- Header -->
		<div class="text-center mb-6 md:mb-10">
			<!-- Language Selector (hidden in Unity WebView) -->
			{#if !isUnityWebView}
				<div class="flex justify-end mb-4">
					<select
						bind:value={language}
						class="px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg text-gray-900 bg-white appearance-none bg-no-repeat bg-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
						style="background-image: url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E'); background-position: right 0.5rem center; background-size: 1.5em 1.5em;"
					>
						<option value="KOR">한국어</option>
						<option value="ENG">English</option>
						<option value="JPN">日本語</option>
					</select>
				</div>
			{:else}
				<div class="flex justify-end mb-4">
					<div class="text-xs text-gray-500 flex items-center space-x-1">
						<span class="w-2 h-2 bg-green-500 rounded-full"></span>
						<span>{t('language_name')}</span>
					</div>
				</div>
			{/if}

			<h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
				{t('title')}
			</h1>
			<p class="text-base md:text-lg lg:text-xl text-gray-600">
				{t('subtitle')}
			</p>
		</div>

		<!-- Menu Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
			<!-- Inquiry Card -->
			<button
				on:click={goToInquiry}
				class="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 md:p-8 text-left overflow-hidden transform hover:-translate-y-1"
			>
				<!-- Background Gradient -->
				<div class="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

				<!-- Content -->
				<div class="relative z-10">
					<!-- Icon -->
					<div class="w-14 h-14 md:w-16 md:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-blue-200 transition-colors duration-300">
						<svg class="w-7 h-7 md:w-8 md:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
						</svg>
					</div>

					<!-- Title -->
					<h2 class="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">
						{t('support_title')}
					</h2>

					<!-- Description -->
					<p class="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
						{t('support_description')}
					</p>

					<!-- Arrow Icon -->
					<div class="flex items-center text-blue-600 text-sm md:text-base font-semibold group-hover:translate-x-2 transition-transform duration-300">
						<span class="mr-2">{t('go_button')}</span>
						<svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
						</svg>
					</div>
				</div>
			</button>

			<!-- Redeem Card -->
			<button
				on:click={goToRedeem}
				class="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 md:p-8 text-left overflow-hidden transform hover:-translate-y-1"
			>
				<!-- Background Gradient -->
				<div class="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

				<!-- Content -->
				<div class="relative z-10">
					<!-- Icon -->
					<div class="w-14 h-14 md:w-16 md:h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-green-200 transition-colors duration-300">
						<svg class="w-7 h-7 md:w-8 md:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
						</svg>
					</div>

					<!-- Title -->
					<h2 class="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">
						{t('redeem_title')}
					</h2>

					<!-- Description -->
					<p class="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
						{t('redeem_description')}
					</p>

					<!-- Arrow Icon -->
					<div class="flex items-center text-green-600 text-sm md:text-base font-semibold group-hover:translate-x-2 transition-transform duration-300">
						<span class="mr-2">{t('go_button')}</span>
						<svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
						</svg>
					</div>
				</div>
			</button>
		</div>

		<!-- Footer Info -->
		{#if isUnityWebView}
			<div class="mt-8 md:mt-12 text-center text-xs md:text-sm text-gray-500">
				<p>Pop Up Pirate Dice</p>
			</div>
		{/if}
	</div>
</div>

<style>
	/* Smooth transitions */
	button {
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}
</style>
