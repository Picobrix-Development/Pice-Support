<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import api from '$lib/api';

	// State
	let language = 'KOR';
	let isUnityWebView = false;
	let uid = '';
	let redeemCode = '';
	let isSubmitting = false;
	let successMessage = '';
	let errorMessage = '';
	let rewardDetails = null;

	// Redeem history
	let history = [];
	let showHistory = false;

	onMount(() => {
		if (browser) {
			// Unity WebView URL 파라미터 처리
			const urlParams = new URLSearchParams($page.url.searchParams);
			const uidParam = urlParams.get('uid');
			const locale = urlParams.get('locale');

			// Unity에서 전달된 파라미터 확인
			if (uidParam) {
				uid = uidParam;
				isUnityWebView = true;
				console.log('Unity WebView detected with UID:', uid);
			} else {
				// 기본값 설정 (웹 브라우저에서 직접 접근)
				uid = 'web_user_' + Date.now();
			}

			// 언어 설정
			if (locale) {
				if (locale.startsWith('ko') || locale.toLowerCase() === 'kor') {
					language = 'KOR';
				} else if (locale.startsWith('en') || locale.toLowerCase() === 'eng') {
					language = 'ENG';
				} else if (locale.startsWith('ja') || locale.toLowerCase() === 'jpn') {
					language = 'JPN';
				} else {
					language = 'ENG';
				}
			}

			// Load redeem history
			loadRedeemHistory();
		}
	});

	// Load redeem history from backend
	async function loadRedeemHistory() {
		if (!uid) return;

		try {
			const response = await api.get(`/redeem/history?user_uid=${encodeURIComponent(uid)}`);
			history = response.data.history || [];
		} catch (error) {
			console.error('Failed to load redeem history:', error);
			// Ignore error - history is optional
		}
	}

	// Submit redeem code
	async function submitRedeemCode() {
		// Reset messages
		successMessage = '';
		errorMessage = '';
		rewardDetails = null;

		// Validate
		if (!redeemCode.trim()) {
			errorMessage = t('error_empty_code');
			return;
		}

		if (!uid) {
			errorMessage = t('error_no_uid');
			return;
		}

		isSubmitting = true;

		try {
			const response = await api.post('/redeem/code', {
				user_uid: uid,
				code: redeemCode.trim().toUpperCase()
			});

			const result = response.data;

			// Success
			rewardDetails = result.rewards || [];
			successMessage = t('redeem_success');
			redeemCode = '';

			// Reload history
			await loadRedeemHistory();

		} catch (error) {
			console.error('Redeem error:', error);

			// Handle specific error codes
			if (error.response?.data?.detail) {
				const detail = error.response.data.detail;

				if (detail.includes('invalid') || detail.includes('not found')) {
					errorMessage = t('error_invalid_code');
				} else if (detail.includes('expired')) {
					errorMessage = t('error_expired_code');
				} else if (detail.includes('already used') || detail.includes('already redeemed')) {
					errorMessage = t('error_already_used');
				} else if (detail.includes('limit')) {
					errorMessage = t('error_limit_reached');
				} else {
					errorMessage = detail;
				}
			} else {
				errorMessage = t('error_generic');
			}
		} finally {
			isSubmitting = false;
		}
	}

	// Format date
	function formatDate(dateString) {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleDateString(language === 'JPN' ? 'ja-JP' : language === 'KOR' ? 'ko-KR' : 'en-US');
	}

	// Get translated text
	function t(key) {
		const translations = {
			KOR: {
				title: '쿠폰 입력',
				subtitle: '쿠폰 코드를 입력하고 보상을 받으세요',
				code_label: '쿠폰 코드',
				code_placeholder: '쿠폰 코드를 입력하세요',
				uid_label: 'UID',
				uid_auto: '(게임에서 자동 설정됨)',
				submit_button: '쿠폰 사용',
				submitting: '처리 중...',
				redeem_success: '쿠폰이 성공적으로 사용되었습니다!',
				rewards_received: '받은 보상:',
				history_title: '사용 내역',
				history_empty: '사용 내역이 없습니다.',
				show_history: '사용 내역 보기',
				hide_history: '사용 내역 숨기기',
				code_column: '코드',
				date_column: '사용일',
				rewards_column: '보상',
				back_to_menu: '메뉴로 돌아가기',
				language_name: '한국어',

				// Errors
				error_empty_code: '쿠폰 코드를 입력해주세요.',
				error_no_uid: 'UID가 없습니다. 게임에서 다시 시도해주세요.',
				error_invalid_code: '유효하지 않은 쿠폰 코드입니다.',
				error_expired_code: '만료된 쿠폰 코드입니다.',
				error_already_used: '이미 사용한 쿠폰입니다.',
				error_limit_reached: '쿠폰 사용 횟수를 초과했습니다.',
				error_generic: '쿠폰 사용에 실패했습니다. 잠시 후 다시 시도해주세요.'
			},
			ENG: {
				title: 'Redeem Code',
				subtitle: 'Enter your coupon code and receive rewards',
				code_label: 'Coupon Code',
				code_placeholder: 'Enter coupon code',
				uid_label: 'UID',
				uid_auto: '(Auto-set from game)',
				submit_button: 'Redeem',
				submitting: 'Processing...',
				redeem_success: 'Coupon redeemed successfully!',
				rewards_received: 'Rewards received:',
				history_title: 'Redeem History',
				history_empty: 'No redeem history.',
				show_history: 'Show History',
				hide_history: 'Hide History',
				code_column: 'Code',
				date_column: 'Date',
				rewards_column: 'Rewards',
				back_to_menu: 'Back to Menu',
				language_name: 'English',

				// Errors
				error_empty_code: 'Please enter a coupon code.',
				error_no_uid: 'No UID found. Please try again from the game.',
				error_invalid_code: 'Invalid coupon code.',
				error_expired_code: 'This coupon has expired.',
				error_already_used: 'You have already used this coupon.',
				error_limit_reached: 'Coupon usage limit reached.',
				error_generic: 'Failed to redeem coupon. Please try again later.'
			},
			JPN: {
				title: 'クーポン入力',
				subtitle: 'クーポンコードを入力して報酬を受け取ります',
				code_label: 'クーポンコード',
				code_placeholder: 'クーポンコードを入力してください',
				uid_label: 'UID',
				uid_auto: '(ゲームから自動設定)',
				submit_button: 'クーポン使用',
				submitting: '処理中...',
				redeem_success: 'クーポンが正常に使用されました！',
				rewards_received: '受け取った報酬：',
				history_title: '使用履歴',
				history_empty: '使用履歴はありません。',
				show_history: '使用履歴を表示',
				hide_history: '使用履歴を非表示',
				code_column: 'コード',
				date_column: '使用日',
				rewards_column: '報酬',
				back_to_menu: 'メニューに戻る',
				language_name: '日本語',

				// Errors
				error_empty_code: 'クーポンコードを入力してください。',
				error_no_uid: 'UIDがありません。ゲームから再度お試しください。',
				error_invalid_code: '無効なクーポンコードです。',
				error_expired_code: '期限切れのクーポンです。',
				error_already_used: 'すでに使用したクーポンです。',
				error_limit_reached: 'クーポンの使用回数を超えました。',
				error_generic: 'クーポンの使用に失敗しました。しばらくしてから再度お試しください。'
			}
		};
		return translations[language]?.[key] || key;
	}
</script>

<svelte:head>
	<title>{t('title')} - Pice Console</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<div class="max-w-2xl mx-auto px-4 py-8">
		<!-- Header with Back Button -->
		<div class="mb-6">
			<a
				href="/support{$page.url.search}"
				class="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-4"
			>
				<svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
				</svg>
				{t('back_to_menu')}
			</a>

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
			{/if}
		</div>

		{#key language}
		<!-- Main Card -->
		<div class="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
			<!-- Title -->
			<div class="flex items-center mb-4 pb-4 border-b border-gray-200">
				<div class="w-12 h-12 md:w-14 md:h-14 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0 mr-3 md:mr-4">
					<svg class="w-6 h-6 md:w-7 md:h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
					</svg>
				</div>
				<div class="flex-1">
					<h1 class="text-lg md:text-xl font-bold text-gray-900">
						{t('title')}
					</h1>
					<p class="text-xs md:text-sm text-gray-600 mt-0.5">
						{t('subtitle')}
					</p>
				</div>
			</div>

			<!-- Form -->
			<form on:submit|preventDefault={submitRedeemCode} class="space-y-6">
				<!-- UID (Read-only from Unity) -->
				<div>
					<label class="block text-sm font-medium text-gray-900 mb-2">
						{t('uid_label')} {#if isUnityWebView}<span class="text-xs text-green-600">{t('uid_auto')}</span>{/if}
					</label>
					<input
						type="text"
						bind:value={uid}
						readonly={isUnityWebView}
						class="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 {isUnityWebView ? 'bg-green-50 border-green-300' : 'bg-gray-50'}"
						placeholder="UID"
					>
				</div>

				<!-- Coupon Code -->
				<div>
					<label class="block text-sm font-medium text-gray-900 mb-2">
						{t('code_label')} <span class="text-red-500">*</span>
					</label>
					<input
						type="text"
						bind:value={redeemCode}
						placeholder={t('code_placeholder')}
						maxlength="50"
						class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 uppercase"
						disabled={isSubmitting}
					>
				</div>

				<!-- Submit Button -->
				<button
					type="submit"
					disabled={isSubmitting || !redeemCode.trim()}
					class="w-full px-6 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed active:scale-95 transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
				>
					{#if isSubmitting}
						<svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						<span>{t('submitting')}</span>
					{:else}
						<span>{t('submit_button')}</span>
					{/if}
				</button>
			</form>

			<!-- Success Message -->
			{#if successMessage}
				<div class="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
					<div class="flex items-start">
						<svg class="w-6 h-6 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
						</svg>
						<div class="flex-1">
							<p class="text-green-800 font-semibold mb-2">{successMessage}</p>
							{#if rewardDetails && rewardDetails.length > 0}
								<p class="text-sm text-green-700 mb-2">{t('rewards_received')}</p>
								<ul class="space-y-1">
									{#each rewardDetails as reward}
										<li class="text-sm text-green-700">
											• {reward.name || reward.item_type}: {reward.amount || reward.quantity}
										</li>
									{/each}
								</ul>
							{/if}
						</div>
					</div>
				</div>
			{/if}

			<!-- Error Message -->
			{#if errorMessage}
				<div class="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
					<div class="flex items-start">
						<svg class="w-6 h-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
						</svg>
						<p class="text-red-800">{errorMessage}</p>
					</div>
				</div>
			{/if}
		</div>

		<!-- History Section -->
		{#if history.length > 0}
			<div class="bg-white rounded-2xl shadow-lg p-6 md:p-8">
				<button
					on:click={() => showHistory = !showHistory}
					class="w-full flex items-center justify-between text-left mb-4"
				>
					<h2 class="text-xl font-bold text-gray-900">
						{t('history_title')} ({history.length})
					</h2>
					<svg
						class="w-6 h-6 text-gray-600 transform transition-transform {showHistory ? 'rotate-180' : ''}"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
					</svg>
				</button>

				{#if showHistory}
					<div class="overflow-x-auto">
						<table class="w-full">
							<thead class="bg-gray-50">
								<tr>
									<th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
										{t('code_column')}
									</th>
									<th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
										{t('date_column')}
									</th>
									<th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
										{t('rewards_column')}
									</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-200">
								{#each history as item}
									<tr class="hover:bg-gray-50">
										<td class="px-4 py-3 text-sm text-gray-900 font-mono">
											{item.code}
										</td>
										<td class="px-4 py-3 text-sm text-gray-600">
											{formatDate(item.redeemed_at)}
										</td>
										<td class="px-4 py-3 text-sm text-gray-600">
											{#if item.rewards && item.rewards.length > 0}
												{item.rewards.map(r => `${r.name || r.item_type}: ${r.amount || r.quantity}`).join(', ')}
											{:else}
												-
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		{/if}
		{/key}
	</div>
</div>

<style>
	input[type="text"] {
		transition: all 0.2s ease;
	}

	input[type="text"]:focus {
		outline: none;
	}

	input[type="text"].uppercase {
		text-transform: uppercase;
	}
</style>
